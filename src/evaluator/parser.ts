/**
 * The parser turns a token stream into an AST.
 *
 * It supports two entry modes:
 *   - "expression": a single expression, used for value directives like
 *     s-data, s-text, s-bind, s-show. A leading `{` is an object literal.
 *   - "program": a list of statements, used for action directives like
 *     s-on handlers and s-init. A leading `{` is a block.
 *
 * That split is how Summit resolves the classic `{ }` ambiguity without any
 * heuristics: the caller already knows whether it wants a value or an action.
 */

import type {
  ArrayExpression,
  ArrowFunction,
  Expression,
  ObjectExpression,
  ObjectProperty,
  Pattern,
  Program,
  SpreadElement,
  Statement,
  VariableDeclaration,
} from "./ast.js";
import { type Token, tokenize } from "./lexer.js";

export class ParseError extends Error {}

export type ParseMode = "expression" | "program";

const KEYWORDS = new Set([
  "true",
  "false",
  "null",
  "undefined",
  "this",
  "typeof",
  "void",
  "in",
  "instanceof",
  "if",
  "else",
  "return",
  "let",
  "const",
  "var",
  "for",
  "of",
  "while",
  "break",
  "continue",
]);

// Binary operator precedence. Higher binds tighter. `**` is right-associative.
const BINARY_PREC: Record<string, number> = {
  "??": 1,
  "||": 2,
  "&&": 3,
  "==": 7,
  "!=": 7,
  "===": 7,
  "!==": 7,
  "<": 8,
  ">": 8,
  "<=": 8,
  ">=": 8,
  in: 8,
  instanceof: 8,
  "+": 10,
  "-": 10,
  "*": 11,
  "/": 11,
  "%": 11,
  "**": 12,
};

const ASSIGN_OPS = new Set(["=", "+=", "-=", "*=", "/=", "%=", "**=", "&&=", "||=", "??="]);

class Parser {
  private tokens: Token[];
  private pos = 0;

  constructor(source: string) {
    this.tokens = tokenize(source);
  }

  private peek(offset = 0): Token {
    return this.tokens[this.pos + offset] ?? this.tokens[this.tokens.length - 1]!;
  }
  private next(): Token {
    return this.tokens[this.pos++] ?? this.tokens[this.tokens.length - 1]!;
  }
  private isPunc(value: string, offset = 0): boolean {
    const t = this.peek(offset);
    return t.type === "punc" && t.value === value;
  }
  private isKeyword(value: string, offset = 0): boolean {
    const t = this.peek(offset);
    return t.type === "ident" && t.value === value;
  }
  private eatPunc(value: string): void {
    if (!this.isPunc(value)) {
      throw new ParseError(`Expected '${value}' but found '${this.peek().value || "end of input"}'`);
    }
    this.pos++;
  }
  private atEnd(): boolean {
    return this.peek().type === "eof";
  }

  // --- Entry points ---

  parseProgram(): Program {
    const body: Statement[] = [];
    while (!this.atEnd()) {
      if (this.isPunc(";")) {
        this.pos++;
        continue;
      }
      body.push(this.parseStatement());
    }
    return { type: "Program", body };
  }

  parseExpressionProgram(): Program {
    const expr = this.parseExpression();
    if (!this.atEnd()) {
      throw new ParseError(`Unexpected trailing input '${this.peek().value}'`);
    }
    return { type: "Program", body: [{ type: "ExpressionStatement", expression: expr }] };
  }

  // --- Statements ---

  private parseStatement(): Statement {
    if (this.isPunc("{")) return this.parseBlock();
    if (this.isKeyword("if")) return this.parseIf();
    if (this.isKeyword("return")) return this.parseReturn();
    if (this.isKeyword("let") || this.isKeyword("const") || this.isKeyword("var")) {
      const decl = this.parseVarDecl();
      this.consumeSemi();
      return decl;
    }
    if (this.isKeyword("for")) return this.parseFor();
    if (this.isKeyword("while")) return this.parseWhile();
    if (this.isKeyword("break")) {
      this.pos++;
      this.consumeSemi();
      return { type: "BreakStatement" };
    }
    if (this.isKeyword("continue")) {
      this.pos++;
      this.consumeSemi();
      return { type: "ContinueStatement" };
    }
    const expression = this.parseExpression();
    this.consumeSemi();
    return { type: "ExpressionStatement", expression };
  }

  private consumeSemi(): void {
    if (this.isPunc(";")) this.pos++;
  }

  private parseBlock(): Statement {
    this.eatPunc("{");
    const body: Statement[] = [];
    while (!this.isPunc("}") && !this.atEnd()) {
      if (this.isPunc(";")) {
        this.pos++;
        continue;
      }
      body.push(this.parseStatement());
    }
    this.eatPunc("}");
    return { type: "BlockStatement", body };
  }

  private parseIf(): Statement {
    this.pos++; // if
    this.eatPunc("(");
    const test = this.parseExpression();
    this.eatPunc(")");
    const consequent = this.parseStatement();
    let alternate: Statement | null = null;
    if (this.isKeyword("else")) {
      this.pos++;
      alternate = this.parseStatement();
    }
    return { type: "IfStatement", test, consequent, alternate };
  }

  private parseReturn(): Statement {
    this.pos++; // return
    let argument: Expression | null = null;
    if (!this.isPunc(";") && !this.isPunc("}") && !this.atEnd()) {
      argument = this.parseExpression();
    }
    this.consumeSemi();
    return { type: "ReturnStatement", argument };
  }

  private parseVarDecl(): VariableDeclaration {
    const kind = this.next().value as "let" | "const" | "var";
    const declarations: VariableDeclaration["declarations"] = [];
    do {
      const id = this.parsePattern();
      let init: Expression | null = null;
      if (this.isPunc("=")) {
        this.pos++;
        init = this.parseAssignment();
      }
      declarations.push({ id, init });
    } while (this.isPunc(",") && (this.pos++, true));
    return { type: "VariableDeclaration", kind, declarations };
  }

  private parseFor(): Statement {
    this.pos++; // for
    this.eatPunc("(");
    // Detect for-of by scanning the init for the `of` keyword before `)`.
    let init: VariableDeclaration | Expression | null = null;
    if (this.isKeyword("let") || this.isKeyword("const") || this.isKeyword("var")) {
      const kind = this.next().value as "let" | "const" | "var";
      const pattern = this.parsePattern();
      if (this.isKeyword("of")) {
        this.pos++;
        const right = this.parseExpression();
        this.eatPunc(")");
        const body = this.parseStatement();
        return {
          type: "ForOfStatement",
          left: { type: "VariableDeclaration", kind, declarations: [{ id: pattern, init: null }] },
          right,
          body,
        };
      }
      // classic for with declaration
      let declInit: Expression | null = null;
      if (this.isPunc("=")) {
        this.pos++;
        declInit = this.parseAssignment();
      }
      const declarations: VariableDeclaration["declarations"] = [{ id: pattern, init: declInit }];
      while (this.isPunc(",")) {
        this.pos++;
        const id = this.parsePattern();
        let vi: Expression | null = null;
        if (this.isPunc("=")) {
          this.pos++;
          vi = this.parseAssignment();
        }
        declarations.push({ id, init: vi });
      }
      init = { type: "VariableDeclaration", kind, declarations };
    } else if (!this.isPunc(";")) {
      init = this.parseExpression();
    }
    this.eatPunc(";");
    const test = this.isPunc(";") ? null : this.parseExpression();
    this.eatPunc(";");
    const update = this.isPunc(")") ? null : this.parseExpression();
    this.eatPunc(")");
    const body = this.parseStatement();
    return { type: "ForStatement", init, test, update, body };
  }

  private parseWhile(): Statement {
    this.pos++; // while
    this.eatPunc("(");
    const test = this.parseExpression();
    this.eatPunc(")");
    const body = this.parseStatement();
    return { type: "WhileStatement", test, body };
  }

  // --- Expressions ---

  parseExpression(): Expression {
    return this.parseAssignment();
  }

  private parseAssignment(): Expression {
    if (this.isArrowAhead()) return this.parseArrow();

    const left = this.parseConditional();
    const t = this.peek();
    if (t.type === "punc" && ASSIGN_OPS.has(t.value)) {
      this.pos++;
      const right = this.parseAssignment();
      return { type: "AssignmentExpression", operator: t.value, left, right };
    }
    return left;
  }

  private parseConditional(): Expression {
    const test = this.parseBinary(1);
    if (this.isPunc("?")) {
      this.pos++;
      const consequent = this.parseAssignment();
      this.eatPunc(":");
      const alternate = this.parseAssignment();
      return { type: "ConditionalExpression", test, consequent, alternate };
    }
    return test;
  }

  private parseBinary(minPrec: number): Expression {
    let left = this.parseUnary();
    for (;;) {
      const t = this.peek();
      const op =
        t.type === "punc" ? t.value : t.type === "ident" && (t.value === "in" || t.value === "instanceof") ? t.value : null;
      if (op === null) break;
      const prec = BINARY_PREC[op];
      if (prec === undefined || prec < minPrec) break;
      this.pos++;
      const rightAssoc = op === "**";
      const right = this.parseBinary(rightAssoc ? prec : prec + 1);
      if (op === "&&" || op === "||" || op === "??") {
        left = { type: "LogicalExpression", operator: op, left, right };
      } else {
        left = { type: "BinaryExpression", operator: op, left, right };
      }
    }
    return left;
  }

  private parseUnary(): Expression {
    const t = this.peek();
    if (t.type === "punc" && (t.value === "!" || t.value === "-" || t.value === "+")) {
      this.pos++;
      return { type: "UnaryExpression", operator: t.value, argument: this.parseUnary() };
    }
    if (t.type === "ident" && (t.value === "typeof" || t.value === "void")) {
      this.pos++;
      return { type: "UnaryExpression", operator: t.value, argument: this.parseUnary() };
    }
    if (t.type === "punc" && (t.value === "++" || t.value === "--")) {
      this.pos++;
      return { type: "UpdateExpression", operator: t.value, prefix: true, argument: this.parseUnary() };
    }
    return this.parsePostfix();
  }

  private parsePostfix(): Expression {
    let node = this.parseCallMember();
    const t = this.peek();
    if (t.type === "punc" && (t.value === "++" || t.value === "--")) {
      this.pos++;
      node = { type: "UpdateExpression", operator: t.value, prefix: false, argument: node };
    }
    return node;
  }

  private parseNewExpr(): Expression {
    this.pos++; // consume 'new'
    // The callee is a member expression, but not a call: in `new a.b()` the
    // parens belong to `new`, and in `new a().b` the `.b` applies to the result.
    let callee = this.parsePrimary();
    for (;;) {
      if (this.isPunc(".")) {
        this.pos++;
        const name = this.next();
        callee = {
          type: "MemberExpression",
          object: callee,
          property: { type: "Identifier", name: name.value },
          computed: false,
          optional: false,
        };
      } else if (this.isPunc("[")) {
        this.pos++;
        const property = this.parseExpression();
        this.eatPunc("]");
        callee = { type: "MemberExpression", object: callee, property, computed: true, optional: false };
      } else {
        break;
      }
    }
    const args = this.isPunc("(") ? this.parseArguments() : [];
    return { type: "NewExpression", callee, arguments: args };
  }

  private parseCallMember(): Expression {
    let node = this.isKeyword("new") ? this.parseNewExpr() : this.parsePrimary();
    for (;;) {
      if (this.isPunc(".")) {
        this.pos++;
        const name = this.next();
        node = {
          type: "MemberExpression",
          object: node,
          property: { type: "Identifier", name: name.value },
          computed: false,
          optional: false,
        };
      } else if (this.isPunc("?.")) {
        this.pos++;
        if (this.isPunc("(")) {
          node = { type: "CallExpression", callee: node, arguments: this.parseArguments(), optional: true };
        } else if (this.isPunc("[")) {
          this.pos++;
          const property = this.parseExpression();
          this.eatPunc("]");
          node = { type: "MemberExpression", object: node, property, computed: true, optional: true };
        } else {
          const name = this.next();
          node = {
            type: "MemberExpression",
            object: node,
            property: { type: "Identifier", name: name.value },
            computed: false,
            optional: true,
          };
        }
      } else if (this.isPunc("[")) {
        this.pos++;
        const property = this.parseExpression();
        this.eatPunc("]");
        node = { type: "MemberExpression", object: node, property, computed: true, optional: false };
      } else if (this.isPunc("(")) {
        node = { type: "CallExpression", callee: node, arguments: this.parseArguments(), optional: false };
      } else {
        break;
      }
    }
    return node;
  }

  private parseArguments(): Expression[] {
    this.eatPunc("(");
    const args: Expression[] = [];
    while (!this.isPunc(")") && !this.atEnd()) {
      if (this.isPunc("...")) {
        this.pos++;
        args.push({ type: "SpreadElement", argument: this.parseAssignment() });
      } else {
        args.push(this.parseAssignment());
      }
      if (this.isPunc(",")) this.pos++;
      else break;
    }
    this.eatPunc(")");
    return args;
  }

  private parsePrimary(): Expression {
    const t = this.peek();

    if (t.type === "num") {
      this.pos++;
      const value = t.value.startsWith("0x") || t.value.startsWith("0X") ? parseInt(t.value, 16) : Number(t.value);
      return { type: "NumberLiteral", value };
    }
    if (t.type === "str") {
      this.pos++;
      return { type: "StringLiteral", value: t.value };
    }
    if (t.type === "tmpl") {
      this.pos++;
      return this.parseTemplate(t.raw ?? "");
    }
    if (t.type === "regex") {
      this.pos++;
      return { type: "RegexLiteral", pattern: t.value, flags: t.flags ?? "" };
    }
    if (t.type === "ident") {
      if (t.value === "true" || t.value === "false") {
        this.pos++;
        return { type: "BooleanLiteral", value: t.value === "true" };
      }
      if (t.value === "null") {
        this.pos++;
        return { type: "NullLiteral" };
      }
      if (t.value === "undefined") {
        this.pos++;
        return { type: "UndefinedLiteral" };
      }
      if (t.value === "this") {
        this.pos++;
        return { type: "ThisExpression" };
      }
      this.pos++;
      return { type: "Identifier", name: t.value };
    }
    if (this.isPunc("(")) {
      this.pos++;
      const first = this.parseAssignment();
      if (this.isPunc(",")) {
        const expressions = [first];
        while (this.isPunc(",")) {
          this.pos++;
          expressions.push(this.parseAssignment());
        }
        this.eatPunc(")");
        return { type: "SequenceExpression", expressions };
      }
      this.eatPunc(")");
      return first;
    }
    if (this.isPunc("[")) {
      return this.parseArray();
    }
    if (this.isPunc("{")) {
      return this.parseObject();
    }

    throw new ParseError(`Unexpected token '${t.value || "end of input"}' in expression`);
  }

  private parseArray(): ArrayExpression {
    this.eatPunc("[");
    const elements: (Expression | null)[] = [];
    while (!this.isPunc("]") && !this.atEnd()) {
      if (this.isPunc(",")) {
        // Elision, e.g. [a, , b].
        elements.push(null);
        this.pos++;
        continue;
      }
      if (this.isPunc("...")) {
        this.pos++;
        elements.push({ type: "SpreadElement", argument: this.parseAssignment() });
      } else {
        elements.push(this.parseAssignment());
      }
      if (this.isPunc(",")) this.pos++;
      else break;
    }
    this.eatPunc("]");
    return { type: "ArrayExpression", elements };
  }

  private parseObject(): ObjectExpression {
    this.eatPunc("{");
    const properties: (ObjectProperty | SpreadElement)[] = [];
    while (!this.isPunc("}") && !this.atEnd()) {
      if (this.isPunc("...")) {
        this.pos++;
        properties.push({ type: "SpreadElement", argument: this.parseAssignment() });
      } else {
        properties.push(this.parseObjectProperty());
      }
      if (this.isPunc(",")) this.pos++;
      else break;
    }
    this.eatPunc("}");
    return { type: "ObjectExpression", properties };
  }

  private parseObjectProperty(): ObjectProperty {
    // `async name() {}` methods are not supported; the synchronous interpreter
    // has no await. Fail with an actionable message instead of misparsing.
    if (this.isKeyword("async") && this.peek(1).type === "ident") {
      throw new ParseError(
        "async methods are not supported in Summit expressions. Use a regular method that returns a Promise and chain .then().",
      );
    }

    // getter / setter: `get name() {}` / `set name(v) {}`
    if (
      (this.isKeyword("get") || this.isKeyword("set")) &&
      !this.isPunc(":", 1) &&
      !this.isPunc(",", 1) &&
      !this.isPunc("(", 1) &&
      !this.isPunc("}", 1)
    ) {
      const kind = this.next().value as "get" | "set";
      const { key, computed } = this.parsePropertyKey();
      const fn = this.parseMethodTail();
      return { key, computed, value: fn, kind, shorthand: false };
    }

    const { key, computed, keyName } = this.parsePropertyKey();

    // Method shorthand: `name() {}`
    if (this.isPunc("(")) {
      const fn = this.parseMethodTail();
      return { key, computed, value: fn, kind: "method", shorthand: false };
    }

    // Normal `key: value`
    if (this.isPunc(":")) {
      this.pos++;
      const value = this.parseAssignment();
      return { key, computed, value, kind: "init", shorthand: false };
    }

    // Shorthand `{ name }`
    if (keyName !== null && !computed) {
      return { key, computed, value: { type: "Identifier", name: keyName }, kind: "init", shorthand: true };
    }

    throw new ParseError(`Invalid object property near '${this.peek().value}'`);
  }

  private parsePropertyKey(): { key: Expression; computed: boolean; keyName: string | null } {
    if (this.isPunc("[")) {
      this.pos++;
      const key = this.parseAssignment();
      this.eatPunc("]");
      return { key, computed: true, keyName: null };
    }
    const t = this.next();
    if (t.type === "str") return { key: { type: "StringLiteral", value: t.value }, computed: false, keyName: t.value };
    if (t.type === "num")
      return { key: { type: "StringLiteral", value: String(Number(t.value)) }, computed: false, keyName: null };
    if (t.type === "ident") return { key: { type: "StringLiteral", value: t.value }, computed: false, keyName: t.value };
    throw new ParseError(`Invalid property key '${t.value}'`);
  }

  private parseMethodTail(): ArrowFunction {
    const params = this.parseParamList();
    const body = this.parseBlock();
    return { type: "ArrowFunction", params, body: body as never, expression: false };
  }

  // --- Arrow functions ---

  private isArrowAhead(): boolean {
    const t = this.peek();
    if (t.type === "ident" && !KEYWORDS.has(t.value) && this.isPunc("=>", 1)) return true;
    if (this.isPunc("(")) {
      // Scan to the matching ')' and check for '=>' right after.
      let depth = 0;
      let i = this.pos;
      for (; i < this.tokens.length; i++) {
        const tok = this.tokens[i]!;
        if (tok.type === "punc" && tok.value === "(") depth++;
        else if (tok.type === "punc" && tok.value === ")") {
          depth--;
          if (depth === 0) break;
        } else if (tok.type === "eof") return false;
      }
      const after = this.tokens[i + 1];
      return !!after && after.type === "punc" && after.value === "=>";
    }
    return false;
  }

  private parseArrow(): ArrowFunction {
    let params: Pattern[];
    if (this.peek().type === "ident") {
      params = [{ type: "Identifier", name: this.next().value }];
    } else {
      params = this.parseParamList();
    }
    this.eatPunc("=>");
    if (this.isPunc("{")) {
      const body = this.parseBlock();
      return { type: "ArrowFunction", params, body: body as never, expression: false };
    }
    const body = this.parseAssignment();
    return { type: "ArrowFunction", params, body, expression: true };
  }

  private parseParamList(): Pattern[] {
    this.eatPunc("(");
    const params: Pattern[] = [];
    while (!this.isPunc(")") && !this.atEnd()) {
      params.push(this.parsePattern());
      if (this.isPunc(",")) this.pos++;
      else break;
    }
    this.eatPunc(")");
    return params;
  }

  // --- Patterns ---

  private parsePattern(): Pattern {
    let pattern: Pattern;
    if (this.isPunc("...")) {
      this.pos++;
      return { type: "RestElement", argument: this.parsePattern() };
    }
    if (this.isPunc("{")) {
      pattern = this.parseObjectPattern();
    } else if (this.isPunc("[")) {
      pattern = this.parseArrayPattern();
    } else {
      const t = this.next();
      if (t.type !== "ident") throw new ParseError(`Invalid binding target '${t.value}'`);
      pattern = { type: "Identifier", name: t.value };
    }
    if (this.isPunc("=")) {
      this.pos++;
      const right = this.parseAssignment();
      return { type: "AssignmentPattern", left: pattern, right };
    }
    return pattern;
  }

  private parseObjectPattern(): Pattern {
    this.eatPunc("{");
    const properties: { key: Expression; value: Pattern; computed: boolean }[] = [];
    let rest: { type: "Identifier"; name: string } | null = null;
    while (!this.isPunc("}") && !this.atEnd()) {
      if (this.isPunc("...")) {
        this.pos++;
        const t = this.next();
        rest = { type: "Identifier", name: t.value };
        break;
      }
      const { key, computed, keyName } = this.parsePropertyKey();
      let value: Pattern;
      if (this.isPunc(":")) {
        this.pos++;
        value = this.parsePattern();
      } else {
        value = { type: "Identifier", name: keyName ?? "" };
        if (this.isPunc("=")) {
          this.pos++;
          value = { type: "AssignmentPattern", left: value, right: this.parseAssignment() };
        }
      }
      properties.push({ key, value, computed });
      if (this.isPunc(",")) this.pos++;
      else break;
    }
    this.eatPunc("}");
    return { type: "ObjectPattern", properties, rest };
  }

  private parseArrayPattern(): Pattern {
    this.eatPunc("[");
    const elements: (Pattern | null)[] = [];
    let rest: Pattern | null = null;
    while (!this.isPunc("]") && !this.atEnd()) {
      if (this.isPunc(",")) {
        elements.push(null);
        this.pos++;
        continue;
      }
      if (this.isPunc("...")) {
        this.pos++;
        rest = this.parsePattern();
        break;
      }
      elements.push(this.parsePattern());
      if (this.isPunc(",")) this.pos++;
      else break;
    }
    this.eatPunc("]");
    return { type: "ArrayPattern", elements, rest };
  }

  // --- Template literals ---

  private parseTemplate(raw: string): Expression {
    const quasis: string[] = [];
    const expressions: Expression[] = [];
    let current = "";
    let i = 0;
    while (i < raw.length) {
      if (raw[i] === "$" && raw[i + 1] === "{") {
        quasis.push(current);
        current = "";
        i += 2;
        let depth = 1;
        let src = "";
        while (i < raw.length && depth > 0) {
          const c = raw[i]!;
          if (c === "{") depth++;
          else if (c === "}") {
            depth--;
            if (depth === 0) break;
          }
          src += c;
          i++;
        }
        i++; // skip closing }
        const stmt = parse(src, "expression").body[0];
        expressions.push(stmt && stmt.type === "ExpressionStatement" ? stmt.expression : { type: "UndefinedLiteral" });
      } else {
        current += raw[i];
        i++;
      }
    }
    quasis.push(current);
    return { type: "TemplateLiteral", quasis, expressions };
  }
}

const cache = new Map<string, Program>();

/** Parse a source string into a Program AST. Cached by (mode, source). */
export function parse(source: string, mode: ParseMode): Program {
  const key = mode + " " + source;
  const cached = cache.get(key);
  if (cached) return cached;
  const parser = new Parser(source);
  const program = mode === "expression" ? parser.parseExpressionProgram() : parser.parseProgram();
  cache.set(key, program);
  return program;
}
