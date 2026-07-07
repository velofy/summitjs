/**
 * Agent-friendly diagnostics.
 *
 * Summit's messages are written to be fixed, by a person or an AI agent, on the
 * next iteration. Each carries a stable code, a plain-language cause, a "did you
 * mean" suggestion where one fits, the offending expression and element, and a
 * link to the exact docs page. The literal `[summit]` prefix is preserved so
 * tooling that greps for it keeps working.
 */

const DOCS = "https://velofy.github.io/summit";

/** Levenshtein edit distance between two short strings. */
function distance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (!m) return n;
  if (!n) return m;
  let prev = Array.from({ length: n + 1 }, (_, j) => j);
  for (let i = 1; i <= m; i++) {
    const curr = [i];
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(prev[j]! + 1, curr[j - 1]! + 1, prev[j - 1]! + cost);
    }
    prev = curr;
  }
  return prev[n]!;
}

/** The closest candidate to `name` within a small edit distance, or null. */
export function suggest(name: string, candidates: Iterable<string>): string | null {
  let best: string | null = null;
  let bestD = Infinity;
  for (const c of candidates) {
    const d = distance(name, c);
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  const limit = name.length <= 4 ? 1 : 2;
  return best !== null && bestD <= limit ? best : null;
}

function describeEl(el: Element): string {
  const tag = el.tagName.toLowerCase();
  const id = el.id ? `#${el.id}` : "";
  const cls = el.classList.length ? "." + Array.from(el.classList).slice(0, 2).join(".") : "";
  return `<${tag}${id}${cls}>`;
}

export interface Diag {
  /** Element the problem is attached to. */
  el?: Element;
  /** The expression that failed, shown verbatim. */
  expression?: string;
  /** Docs slug to link, e.g. "s-for" -> https://.../s-for/. */
  doc?: string;
  /** A one-line "here is how to fix it" hint. */
  hint?: string;
  /** The underlying thrown value, logged after the formatted message. */
  cause?: unknown;
}

function build(code: string, message: string, ctx: Diag): string {
  const lines = [`[summit] ${code}: ${message}`];
  if (ctx.hint) lines.push(`  ${ctx.hint}`);
  if (ctx.expression) lines.push(`  expression: ${ctx.expression.trim()}`);
  if (ctx.el) lines.push(`  element: ${describeEl(ctx.el)}`);
  lines.push(`  docs: ${DOCS}/${ctx.doc ? ctx.doc + "/" : ""}`);
  return lines.join("\n");
}

export function warn(code: string, message: string, ctx: Diag = {}): void {
  if (ctx.cause !== undefined) console.warn(build(code, message, ctx), "\n ", ctx.cause);
  else console.warn(build(code, message, ctx));
}

export function fail(code: string, message: string, ctx: Diag = {}): void {
  if (ctx.cause !== undefined) console.error(build(code, message, ctx), "\n ", ctx.cause);
  else console.error(build(code, message, ctx));
}

const seen = new Set<string>();
/** Warn once per unique key, so a repeated typo does not flood the console. */
export function warnOnce(key: string, code: string, message: string, ctx: Diag = {}): void {
  if (seen.has(key)) return;
  seen.add(key);
  warn(code, message, ctx);
}
