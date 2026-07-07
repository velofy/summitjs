/**
 * The lexer turns an expression string into a flat list of tokens.
 *
 * This is step one of Summit's CSP-safe evaluator. Because Summit never calls
 * `new Function` or `eval`, it must understand the expression language itself.
 * The lexer recognizes numbers, strings, template literals, identifiers, and a
 * fixed set of operators/punctuators.
 */

export type TokenType = "num" | "str" | "tmpl" | "ident" | "punc" | "eof";

export interface Token {
  type: TokenType;
  value: string;
  /** For template literals: the raw inner source between the backticks. */
  raw?: string;
  start: number;
  end: number;
}

// Multi-character punctuators, longest first so the scanner is greedy.
const PUNCTUATORS = [
  "...",
  "===",
  "!==",
  "**=",
  "&&=",
  "||=",
  "??=",
  "==",
  "!=",
  "<=",
  ">=",
  "&&",
  "||",
  "??",
  "?.",
  "=>",
  "++",
  "--",
  "+=",
  "-=",
  "*=",
  "/=",
  "%=",
  "**",
  "(",
  ")",
  "[",
  "]",
  "{",
  "}",
  ".",
  ",",
  ";",
  ":",
  "?",
  "+",
  "-",
  "*",
  "/",
  "%",
  "<",
  ">",
  "=",
  "!",
];

export class LexError extends Error {}

function isIdentStart(ch: string): boolean {
  return /[A-Za-z_$]/.test(ch);
}
function isIdentPart(ch: string): boolean {
  return /[A-Za-z0-9_$]/.test(ch);
}
function isDigit(ch: string): boolean {
  return ch >= "0" && ch <= "9";
}

export function tokenize(input: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;
  const n = input.length;

  while (i < n) {
    const ch = input[i]!;

    // Whitespace.
    if (ch === " " || ch === "\t" || ch === "\n" || ch === "\r") {
      i++;
      continue;
    }

    // Numbers: decimal, float, exponent, and hex (0x...).
    if (isDigit(ch) || (ch === "." && isDigit(input[i + 1] ?? ""))) {
      const start = i;
      if (ch === "0" && (input[i + 1] === "x" || input[i + 1] === "X")) {
        i += 2;
        while (i < n && /[0-9a-fA-F]/.test(input[i]!)) i++;
      } else {
        while (i < n && isDigit(input[i]!)) i++;
        if (input[i] === ".") {
          i++;
          while (i < n && isDigit(input[i]!)) i++;
        }
        if (input[i] === "e" || input[i] === "E") {
          i++;
          if (input[i] === "+" || input[i] === "-") i++;
          while (i < n && isDigit(input[i]!)) i++;
        }
      }
      tokens.push({ type: "num", value: input.slice(start, i), start, end: i });
      continue;
    }

    // Strings.
    if (ch === '"' || ch === "'") {
      const start = i;
      const quote = ch;
      i++;
      let value = "";
      while (i < n && input[i] !== quote) {
        if (input[i] === "\\") {
          value += readEscape(input, i);
          i += 2;
        } else {
          value += input[i];
          i++;
        }
      }
      if (i >= n) throw new LexError(`Unterminated string in expression: ${input}`);
      i++; // closing quote
      tokens.push({ type: "str", value, start, end: i });
      continue;
    }

    // Template literals. Captured raw between backticks; parsed later. Nested
    // `${ ... }` is tracked by brace depth so inner objects do not end it early.
    if (ch === "`") {
      const start = i;
      i++;
      let raw = "";
      let depth = 0;
      while (i < n) {
        const c = input[i]!;
        if (c === "\\") {
          raw += input[i]! + (input[i + 1] ?? "");
          i += 2;
          continue;
        }
        if (c === "`" && depth === 0) break;
        if (c === "$" && input[i + 1] === "{") {
          depth++;
          raw += "${";
          i += 2;
          continue;
        }
        if (c === "}" && depth > 0) {
          depth--;
          raw += "}";
          i++;
          continue;
        }
        raw += c;
        i++;
      }
      if (i >= n) throw new LexError(`Unterminated template literal: ${input}`);
      i++; // closing backtick
      tokens.push({ type: "tmpl", value: raw, raw, start, end: i });
      continue;
    }

    // Identifiers and keywords.
    if (isIdentStart(ch)) {
      const start = i;
      i++;
      while (i < n && isIdentPart(input[i]!)) i++;
      tokens.push({ type: "ident", value: input.slice(start, i), start, end: i });
      continue;
    }

    // Punctuators / operators.
    let matched = false;
    for (const p of PUNCTUATORS) {
      if (input.startsWith(p, i)) {
        tokens.push({ type: "punc", value: p, start: i, end: i + p.length });
        i += p.length;
        matched = true;
        break;
      }
    }
    if (!matched) {
      throw new LexError(`Unexpected character '${ch}' in expression: ${input}`);
    }
  }

  tokens.push({ type: "eof", value: "", start: n, end: n });
  return tokens;
}

function readEscape(input: string, at: number): string {
  const next = input[at + 1];
  switch (next) {
    case "n":
      return "\n";
    case "t":
      return "\t";
    case "r":
      return "\r";
    case "b":
      return "\b";
    case "f":
      return "\f";
    case "v":
      return "\v";
    case "0":
      return "\0";
    case "\\":
      return "\\";
    case "'":
      return "'";
    case '"':
      return '"';
    case "`":
      return "`";
    default:
      return next ?? "";
  }
}
