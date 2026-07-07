/**
 * The interpreter walks an AST and produces a value. It never calls `eval` or
 * `new Function`, so a strict `script-src` CSP with no `unsafe-eval` is fully
 * satisfied. Identifiers resolve first against interpreter-local bindings
 * (arrow params, let/const), then the component data scope (the RootEnv), then
 * a small allowlist of safe globals.
 */

import type {
  ArrowFunction,
  BlockStatement,
  Expression,
  Node,
  ObjectProperty,
  Pattern,
  Program,
  SpreadElement,
  Statement,
} from "./ast.js";

/** The component-level environment: the merged s-data stack plus magics. */
export interface RootEnv {
  has(name: string): boolean;
  get(name: string): unknown;
  set(name: string, value: unknown): void;
}

// Control-flow signals, thrown and caught internally.
class ReturnSignal {
  constructor(public value: unknown) {}
}
class BreakSignal {}
class ContinueSignal {}

class LexicalScope {
  private vars = new Map<string, { value: unknown; constant: boolean }>();
  constructor(public parent: LexicalScope | null) {}

  declare(name: string, value: unknown, constant: boolean): void {
    this.vars.set(name, { value, constant });
  }
  private find(name: string): LexicalScope | null {
    let s: LexicalScope | null = this;
    while (s) {
      if (s.vars.has(name)) return s;
      s = s.parent;
    }
    return null;
  }
  has(name: string): boolean {
    return this.find(name) !== null;
  }
  get(name: string): unknown {
    return this.find(name)?.vars.get(name)?.value;
  }
  set(name: string, value: unknown): boolean {
    const owner = this.find(name);
    if (!owner) return false;
    const entry = owner.vars.get(name)!;
    if (entry.constant) throw new TypeError(`Assignment to constant '${name}'`);
    entry.value = value;
    return true;
  }
}

// The allowlist of globals expressions may reach. Extensible via addGlobals().
const GLOBAL_ALLOW = new Set<string>([
  "Math",
  "JSON",
  "Date",
  "Object",
  "Array",
  "Number",
  "String",
  "Boolean",
  "parseInt",
  "parseFloat",
  "isNaN",
  "isFinite",
  "RegExp",
  "Map",
  "Set",
  "WeakMap",
  "WeakSet",
  "Promise",
  "Intl",
  "console",
  "window",
  "document",
  "location",
  "navigator",
  "history",
  "localStorage",
  "sessionStorage",
  "setTimeout",
  "clearTimeout",
  "setInterval",
  "clearInterval",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "fetch",
  "alert",
  "confirm",
  "prompt",
  "structuredClone",
  "URL",
  "URLSearchParams",
  "encodeURIComponent",
  "decodeURIComponent",
  "NaN",
  "Infinity",
]);

/** Add names to the global allowlist that expressions may access. */
export function addGlobals(names: string[]): void {
  for (const n of names) GLOBAL_ALLOW.add(n);
}

function memberGet(obj: unknown, key: PropertyKey): unknown {
  // Tolerant reads: a property access on null/undefined yields undefined rather
  // than throwing, which makes optional-chaining-style access safe by default.
  if (obj == null) return undefined;
  return (obj as Record<PropertyKey, unknown>)[key];
}

export class Interpreter {
  constructor(private root: RootEnv) {}

  run(program: Program, thisVal: unknown): unknown {
    const scope = new LexicalScope(null);
    let result: unknown;
    try {
      for (const stmt of program.body) {
        if (stmt.type === "ExpressionStatement") {
          result = this.evalExpr(stmt.expression, scope, thisVal);
        } else {
          this.execStmt(stmt, scope, thisVal);
        }
      }
    } catch (signal) {
      if (signal instanceof ReturnSignal) return signal.value;
      throw signal;
    }
    return result;
  }

  // --- Statements ---

  private execBlock(body: Statement[], scope: LexicalScope, thisVal: unknown): void {
    for (const stmt of body) this.execStmt(stmt, scope, thisVal);
  }

  private execStmt(node: Statement, scope: LexicalScope, thisVal: unknown): void {
    switch (node.type) {
      case "ExpressionStatement":
        this.evalExpr(node.expression, scope, thisVal);
        return;
      case "BlockStatement":
        this.execBlock(node.body, new LexicalScope(scope), thisVal);
        return;
      case "IfStatement":
        if (this.evalExpr(node.test, scope, thisVal)) this.execStmt(node.consequent, scope, thisVal);
        else if (node.alternate) this.execStmt(node.alternate, scope, thisVal);
        return;
      case "ReturnStatement":
        throw new ReturnSignal(node.argument ? this.evalExpr(node.argument, scope, thisVal) : undefined);
      case "VariableDeclaration":
        for (const decl of node.declarations) {
          const value = decl.init ? this.evalExpr(decl.init, scope, thisVal) : undefined;
          this.bindPattern(decl.id, value, scope, node.kind === "const");
        }
        return;
      case "WhileStatement":
        while (this.evalExpr(node.test, scope, thisVal)) {
          try {
            this.execStmt(node.body, new LexicalScope(scope), thisVal);
          } catch (s) {
            if (s instanceof BreakSignal) break;
            if (s instanceof ContinueSignal) continue;
            throw s;
          }
        }
        return;
      case "ForOfStatement": {
        const iterable = this.evalExpr(node.right, scope, thisVal) as Iterable<unknown>;
        for (const item of iterable ?? []) {
          const loopScope = new LexicalScope(scope);
          if (node.left.type === "VariableDeclaration") {
            this.bindPattern(node.left.declarations[0]!.id, item, loopScope, node.left.kind === "const");
          } else {
            this.assignPattern(node.left as Pattern, item, loopScope, thisVal);
          }
          try {
            this.execStmt(node.body, loopScope, thisVal);
          } catch (s) {
            if (s instanceof BreakSignal) break;
            if (s instanceof ContinueSignal) continue;
            throw s;
          }
        }
        return;
      }
      case "ForStatement": {
        const forScope = new LexicalScope(scope);
        if (node.init) {
          if (node.init.type === "VariableDeclaration") this.execStmt(node.init, forScope, thisVal);
          else this.evalExpr(node.init, forScope, thisVal);
        }
        while (node.test ? this.evalExpr(node.test, forScope, thisVal) : true) {
          try {
            this.execStmt(node.body, new LexicalScope(forScope), thisVal);
          } catch (s) {
            if (s instanceof BreakSignal) break;
            if (s instanceof ContinueSignal) {
              /* fall through to update */
            } else throw s;
          }
          if (node.update) this.evalExpr(node.update, forScope, thisVal);
        }
        return;
      }
      case "BreakStatement":
        throw new BreakSignal();
      case "ContinueStatement":
        throw new ContinueSignal();
    }
  }

  // --- Expressions ---

  private evalExpr(node: Expression, scope: LexicalScope, thisVal: unknown): unknown {
    switch (node.type) {
      case "NumberLiteral":
      case "StringLiteral":
      case "BooleanLiteral":
        return node.value;
      case "NullLiteral":
        return null;
      case "UndefinedLiteral":
        return undefined;
      case "ThisExpression":
        return thisVal;
      case "Identifier":
        return this.resolve(node.name, scope);
      case "TemplateLiteral": {
        let out = node.quasis[0] ?? "";
        for (let i = 0; i < node.expressions.length; i++) {
          out += String(this.evalExpr(node.expressions[i]!, scope, thisVal) ?? "");
          out += node.quasis[i + 1] ?? "";
        }
        return out;
      }
      case "ArrayExpression": {
        const arr: unknown[] = [];
        for (const el of node.elements) {
          if (el === null) arr.push(undefined);
          else if (el.type === "SpreadElement") arr.push(...(this.evalExpr(el.argument, scope, thisVal) as unknown[]));
          else arr.push(this.evalExpr(el, scope, thisVal));
        }
        return arr;
      }
      case "ObjectExpression":
        return this.evalObject(node, scope, thisVal);
      case "UnaryExpression": {
        const arg = this.evalExpr(node.argument, scope, thisVal);
        switch (node.operator) {
          case "!":
            return !arg;
          case "-":
            return -(arg as number);
          case "+":
            return +(arg as number);
          case "typeof":
            return typeof arg;
          case "void":
            return undefined;
        }
        return undefined;
      }
      case "UpdateExpression": {
        const old = Number(this.evalTarget(node.argument, scope, thisVal));
        const next = node.operator === "++" ? old + 1 : old - 1;
        this.assign(node.argument, next, scope, thisVal);
        return node.prefix ? next : old;
      }
      case "BinaryExpression":
        return this.evalBinary(
          node.operator,
          this.evalExpr(node.left, scope, thisVal),
          this.evalExpr(node.right, scope, thisVal),
        );
      case "LogicalExpression": {
        const left = this.evalExpr(node.left, scope, thisVal);
        if (node.operator === "&&") return left ? this.evalExpr(node.right, scope, thisVal) : left;
        if (node.operator === "||") return left ? left : this.evalExpr(node.right, scope, thisVal);
        return left ?? this.evalExpr(node.right, scope, thisVal); // ??
      }
      case "ConditionalExpression":
        return this.evalExpr(node.test, scope, thisVal)
          ? this.evalExpr(node.consequent, scope, thisVal)
          : this.evalExpr(node.alternate, scope, thisVal);
      case "AssignmentExpression":
        return this.evalAssignment(node, scope, thisVal);
      case "MemberExpression": {
        const obj = this.evalExpr(node.object, scope, thisVal);
        if (node.optional && obj == null) return undefined;
        const key = node.computed
          ? (this.evalExpr(node.property, scope, thisVal) as PropertyKey)
          : (node.property as { name: string }).name;
        return memberGet(obj, key);
      }
      case "CallExpression":
        return this.evalCall(node, scope, thisVal);
      case "ArrowFunction":
        return this.makeFunction(node, scope, /* lexicalThis */ thisVal, /* dynamic */ false);
      case "SequenceExpression": {
        let v: unknown;
        for (const e of node.expressions) v = this.evalExpr(e, scope, thisVal);
        return v;
      }
      case "SpreadElement":
        return this.evalExpr(node.argument, scope, thisVal);
    }
  }

  private evalObject(
    node: Extract<Expression, { type: "ObjectExpression" }>,
    scope: LexicalScope,
    thisVal: unknown,
  ): Record<string, unknown> {
    const obj: Record<string, unknown> = {};
    for (const prop of node.properties) {
      if ((prop as { type?: string }).type === "SpreadElement") {
        Object.assign(obj, this.evalExpr((prop as SpreadElement).argument, scope, thisVal) as object);
        continue;
      }
      const p = prop as ObjectProperty;
      const key = p.computed
        ? String(this.evalExpr(p.key, scope, thisVal))
        : (p.key as { value: string }).value;
      if (p.kind === "get") {
        const fn = this.makeFunction(p.value as ArrowFunction, scope, thisVal, true);
        Object.defineProperty(obj, key, { get: fn as () => unknown, enumerable: true, configurable: true });
      } else if (p.kind === "set") {
        const fn = this.makeFunction(p.value as ArrowFunction, scope, thisVal, true);
        Object.defineProperty(obj, key, { set: fn as (v: unknown) => void, enumerable: true, configurable: true });
      } else if (p.kind === "method") {
        obj[key] = this.makeFunction(p.value as ArrowFunction, scope, thisVal, true);
      } else {
        obj[key] = this.evalExpr(p.value, scope, thisVal);
      }
    }
    return obj;
  }

  private evalCall(
    node: Extract<Expression, { type: "CallExpression" }>,
    scope: LexicalScope,
    thisVal: unknown,
  ): unknown {
    let fn: unknown;
    let callThis: unknown = undefined;
    if (node.callee.type === "MemberExpression") {
      const m = node.callee;
      const obj = this.evalExpr(m.object, scope, thisVal);
      if (m.optional && obj == null) return undefined;
      callThis = obj;
      const key = m.computed ? (this.evalExpr(m.property, scope, thisVal) as PropertyKey) : (m.property as { name: string }).name;
      fn = memberGet(obj, key);
    } else {
      fn = this.evalExpr(node.callee, scope, thisVal);
    }
    if (node.optional && fn == null) return undefined;
    const args = this.evalArguments(node.arguments, scope, thisVal);
    if (typeof fn !== "function") {
      if (fn == null) return undefined; // tolerant: calling a missing method is a no-op
      throw new TypeError(`Expression value is not a function`);
    }
    return (fn as (...a: unknown[]) => unknown).apply(callThis, args);
  }

  private evalArguments(nodes: Expression[], scope: LexicalScope, thisVal: unknown): unknown[] {
    const args: unknown[] = [];
    for (const a of nodes) {
      if (a.type === "SpreadElement") args.push(...(this.evalExpr(a.argument, scope, thisVal) as unknown[]));
      else args.push(this.evalExpr(a, scope, thisVal));
    }
    return args;
  }

  private evalBinary(op: string, l: unknown, r: unknown): unknown {
    switch (op) {
      case "+":
        return (l as number) + (r as number);
      case "-":
        return (l as number) - (r as number);
      case "*":
        return (l as number) * (r as number);
      case "/":
        return (l as number) / (r as number);
      case "%":
        return (l as number) % (r as number);
      case "**":
        return (l as number) ** (r as number);
      case "==":
        return l == r;
      case "!=":
        return l != r;
      case "===":
        return l === r;
      case "!==":
        return l !== r;
      case "<":
        return (l as number) < (r as number);
      case ">":
        return (l as number) > (r as number);
      case "<=":
        return (l as number) <= (r as number);
      case ">=":
        return (l as number) >= (r as number);
      case "in":
        return (l as PropertyKey) in (r as object);
      case "instanceof":
        return l instanceof (r as never);
    }
    return undefined;
  }

  private evalAssignment(
    node: Extract<Expression, { type: "AssignmentExpression" }>,
    scope: LexicalScope,
    thisVal: unknown,
  ): unknown {
    const op = node.operator;
    if (op === "=") {
      const value = this.evalExpr(node.right, scope, thisVal);
      this.assign(node.left, value, scope, thisVal);
      return value;
    }
    // Compound assignment.
    const current = this.evalTarget(node.left, scope, thisVal);
    let value: unknown;
    if (op === "&&=") {
      if (!current) return current;
      value = this.evalExpr(node.right, scope, thisVal);
    } else if (op === "||=") {
      if (current) return current;
      value = this.evalExpr(node.right, scope, thisVal);
    } else if (op === "??=") {
      if (current != null) return current;
      value = this.evalExpr(node.right, scope, thisVal);
    } else {
      const rhs = this.evalExpr(node.right, scope, thisVal);
      value = this.evalBinary(op.slice(0, -1), current, rhs);
    }
    this.assign(node.left, value, scope, thisVal);
    return value;
  }

  /** Read the current value of an assignment target (for compound ops). */
  private evalTarget(node: Expression, scope: LexicalScope, thisVal: unknown): unknown {
    return this.evalExpr(node, scope, thisVal);
  }

  private assign(target: Expression, value: unknown, scope: LexicalScope, thisVal: unknown): void {
    if (target.type === "Identifier") {
      if (!scope.set(target.name, value)) this.root.set(target.name, value);
      return;
    }
    if (target.type === "MemberExpression") {
      const obj = this.evalExpr(target.object, scope, thisVal);
      if (obj == null) throw new TypeError("Cannot assign to a property of null or undefined");
      const key = target.computed
        ? (this.evalExpr(target.property, scope, thisVal) as PropertyKey)
        : (target.property as { name: string }).name;
      (obj as Record<PropertyKey, unknown>)[key] = value;
      return;
    }
    throw new TypeError("Invalid assignment target");
  }

  private resolve(name: string, scope: LexicalScope): unknown {
    if (scope.has(name)) return scope.get(name);
    if (this.root.has(name)) return this.root.get(name);
    if (GLOBAL_ALLOW.has(name)) return (globalThis as Record<string, unknown>)[name];
    return undefined;
  }

  // --- Functions ---

  private makeFunction(
    node: ArrowFunction,
    definingScope: LexicalScope,
    lexicalThis: unknown,
    dynamicThis: boolean,
  ): (...args: unknown[]) => unknown {
    const self = this;
    return function (this: unknown, ...args: unknown[]): unknown {
      const fnScope = new LexicalScope(definingScope);
      self.bindParams(node.params, args, fnScope);
      const usedThis = dynamicThis ? this : lexicalThis;
      if (node.expression) {
        return self.evalExpr(node.body as Expression, fnScope, usedThis);
      }
      try {
        self.execBlock((node.body as BlockStatement).body, new LexicalScope(fnScope), usedThis);
      } catch (signal) {
        if (signal instanceof ReturnSignal) return signal.value;
        throw signal;
      }
      return undefined;
    };
  }

  private bindParams(params: Pattern[], args: unknown[], scope: LexicalScope): void {
    for (let i = 0; i < params.length; i++) {
      const p = params[i]!;
      if (p.type === "RestElement") {
        this.bindPattern(p.argument, args.slice(i), scope, false);
        break;
      }
      this.bindPattern(p, args[i], scope, false);
    }
  }

  private bindPattern(pattern: Pattern, value: unknown, scope: LexicalScope, constant: boolean): void {
    switch (pattern.type) {
      case "Identifier":
        scope.declare(pattern.name, value, constant);
        return;
      case "AssignmentPattern":
        this.bindPattern(pattern.left, value === undefined ? this.evalExpr(pattern.right, scope, undefined) : value, scope, constant);
        return;
      case "RestElement":
        this.bindPattern(pattern.argument, value, scope, constant);
        return;
      case "ObjectPattern": {
        const obj = (value ?? {}) as Record<string, unknown>;
        const used = new Set<string>();
        for (const prop of pattern.properties) {
          const key = prop.computed
            ? String(this.evalExpr(prop.key, scope, undefined))
            : (prop.key as { value: string }).value;
          used.add(key);
          this.bindPattern(prop.value, obj[key], scope, constant);
        }
        if (pattern.rest) {
          const rest: Record<string, unknown> = {};
          for (const k of Object.keys(obj)) if (!used.has(k)) rest[k] = obj[k];
          scope.declare(pattern.rest.name, rest, constant);
        }
        return;
      }
      case "ArrayPattern": {
        const arr = (value ?? []) as unknown[];
        for (let i = 0; i < pattern.elements.length; i++) {
          const el = pattern.elements[i];
          if (el) this.bindPattern(el, arr[i], scope, constant);
        }
        if (pattern.rest) this.bindPattern(pattern.rest, arr.slice(pattern.elements.length), scope, constant);
        return;
      }
    }
  }

  /** Assign into an existing pattern target (for-of without declaration). */
  private assignPattern(pattern: Pattern, value: unknown, scope: LexicalScope, thisVal: unknown): void {
    if (pattern.type === "Identifier") {
      if (!scope.set(pattern.name, value)) this.root.set(pattern.name, value);
      return;
    }
    // Fall back to declaring for destructuring targets.
    this.bindPattern(pattern, value, scope, false);
    void thisVal;
  }
}

/** Convenience: is `x` a Node? Used only in tests/tools. */
export function isNode(x: unknown): x is Node {
  return typeof x === "object" && x !== null && "type" in x;
}
