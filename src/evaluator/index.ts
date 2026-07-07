/**
 * Public evaluator API.
 *
 * `evaluateExpression` runs a value expression (s-data, s-text, :bind, s-show).
 * `evaluateAction` runs a statement list (s-on handlers, s-init). Both parse to
 * a cached AST and interpret it with no `eval` / `new Function`, so Summit runs
 * under a strict Content-Security-Policy out of the box.
 */

import { parse } from "./parser.js";
import { Interpreter, type RootEnv, addGlobals } from "./interpreter.js";

export { addGlobals };
export type { RootEnv };
export { ParseError } from "./parser.js";
export { LexError } from "./lexer.js";

/** Evaluate a value expression against a component environment. */
export function evaluateExpression(source: string, root: RootEnv, thisVal?: unknown): unknown {
  const program = parse(source, "expression");
  return new Interpreter(root).run(program, thisVal);
}

/** Evaluate an action (one or more statements) against a component environment. */
export function evaluateAction(source: string, root: RootEnv, thisVal?: unknown): unknown {
  const program = parse(source, "program");
  return new Interpreter(root).run(program, thisVal);
}

/**
 * Pre-compile an expression into a reusable evaluator bound to nothing but the
 * source. Handy for directives that re-evaluate the same string many times.
 */
export function compileExpression(source: string): (root: RootEnv, thisVal?: unknown) => unknown {
  const program = parse(source, "expression");
  return (root, thisVal) => new Interpreter(root).run(program, thisVal);
}

export function compileAction(source: string): (root: RootEnv, thisVal?: unknown) => unknown {
  const program = parse(source, "program");
  return (root, thisVal) => new Interpreter(root).run(program, thisVal);
}
