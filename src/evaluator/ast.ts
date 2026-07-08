/**
 * The AST node shapes produced by the parser and consumed by the interpreter.
 * These describe the bounded subset of JavaScript that Summit expressions may
 * use. Anything outside this set is a parse error, which is exactly what keeps
 * the evaluator safe without `eval`.
 */

export type Node = Expression | Statement | Program;

export interface Program {
  type: "Program";
  body: Statement[];
}

// --- Expressions ---

export type Expression =
  | NumberLiteral
  | StringLiteral
  | TemplateLiteral
  | BooleanLiteral
  | NullLiteral
  | UndefinedLiteral
  | Identifier
  | ThisExpression
  | ArrayExpression
  | ObjectExpression
  | UnaryExpression
  | UpdateExpression
  | BinaryExpression
  | LogicalExpression
  | ConditionalExpression
  | AssignmentExpression
  | MemberExpression
  | CallExpression
  | NewExpression
  | ArrowFunction
  | SequenceExpression
  | SpreadElement;

export interface NumberLiteral {
  type: "NumberLiteral";
  value: number;
}
export interface StringLiteral {
  type: "StringLiteral";
  value: string;
}
export interface TemplateLiteral {
  type: "TemplateLiteral";
  quasis: string[];
  expressions: Expression[];
}
export interface BooleanLiteral {
  type: "BooleanLiteral";
  value: boolean;
}
export interface NullLiteral {
  type: "NullLiteral";
}
export interface UndefinedLiteral {
  type: "UndefinedLiteral";
}
export interface Identifier {
  type: "Identifier";
  name: string;
}
export interface ThisExpression {
  type: "ThisExpression";
}
export interface ArrayExpression {
  type: "ArrayExpression";
  elements: (Expression | null)[];
}
export interface ObjectProperty {
  key: Expression;
  computed: boolean;
  value: Expression;
  kind: "init" | "get" | "set" | "method";
  shorthand: boolean;
}
export interface ObjectExpression {
  type: "ObjectExpression";
  properties: (ObjectProperty | SpreadElement)[];
}
export interface SpreadElement {
  type: "SpreadElement";
  argument: Expression;
}
export interface UnaryExpression {
  type: "UnaryExpression";
  operator: string;
  argument: Expression;
}
export interface UpdateExpression {
  type: "UpdateExpression";
  operator: "++" | "--";
  prefix: boolean;
  argument: Expression;
}
export interface BinaryExpression {
  type: "BinaryExpression";
  operator: string;
  left: Expression;
  right: Expression;
}
export interface LogicalExpression {
  type: "LogicalExpression";
  operator: "&&" | "||" | "??";
  left: Expression;
  right: Expression;
}
export interface ConditionalExpression {
  type: "ConditionalExpression";
  test: Expression;
  consequent: Expression;
  alternate: Expression;
}
export interface AssignmentExpression {
  type: "AssignmentExpression";
  operator: string;
  left: Expression;
  right: Expression;
}
export interface MemberExpression {
  type: "MemberExpression";
  object: Expression;
  property: Expression;
  computed: boolean;
  optional: boolean;
}
export interface CallExpression {
  type: "CallExpression";
  callee: Expression;
  arguments: Expression[];
  optional: boolean;
}
export interface NewExpression {
  type: "NewExpression";
  callee: Expression;
  arguments: Expression[];
}
export interface ArrowFunction {
  type: "ArrowFunction";
  params: Pattern[];
  body: Expression | BlockStatement;
  expression: boolean;
}
export interface SequenceExpression {
  type: "SequenceExpression";
  expressions: Expression[];
}

// --- Patterns (function params, destructuring targets) ---

export type Pattern = Identifier | ObjectPattern | ArrayPattern | AssignmentPattern | RestElement;

export interface ObjectPattern {
  type: "ObjectPattern";
  properties: { key: Expression; value: Pattern; computed: boolean }[];
  rest: Identifier | null;
}
export interface ArrayPattern {
  type: "ArrayPattern";
  elements: (Pattern | null)[];
  rest: Pattern | null;
}
export interface AssignmentPattern {
  type: "AssignmentPattern";
  left: Pattern;
  right: Expression;
}
export interface RestElement {
  type: "RestElement";
  argument: Pattern;
}

// --- Statements ---

export type Statement =
  | ExpressionStatement
  | BlockStatement
  | IfStatement
  | ReturnStatement
  | VariableDeclaration
  | ForOfStatement
  | ForStatement
  | WhileStatement
  | BreakStatement
  | ContinueStatement;

export interface ExpressionStatement {
  type: "ExpressionStatement";
  expression: Expression;
}
export interface BlockStatement {
  type: "BlockStatement";
  body: Statement[];
}
export interface IfStatement {
  type: "IfStatement";
  test: Expression;
  consequent: Statement;
  alternate: Statement | null;
}
export interface ReturnStatement {
  type: "ReturnStatement";
  argument: Expression | null;
}
export interface VariableDeclaration {
  type: "VariableDeclaration";
  kind: "let" | "const" | "var";
  declarations: { id: Pattern; init: Expression | null }[];
}
export interface ForOfStatement {
  type: "ForOfStatement";
  left: VariableDeclaration | Pattern;
  right: Expression;
  body: Statement;
}
export interface ForStatement {
  type: "ForStatement";
  init: VariableDeclaration | Expression | null;
  test: Expression | null;
  update: Expression | null;
  body: Statement;
}
export interface WhileStatement {
  type: "WhileStatement";
  test: Expression;
  body: Statement;
}
export interface BreakStatement {
  type: "BreakStatement";
}
export interface ContinueStatement {
  type: "ContinueStatement";
}
