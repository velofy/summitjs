/**
 * s-mask: format an input as the user types against a pattern.
 *
 *   <input s-mask="'(999) 999-9999'">
 *
 * Pattern tokens: 9 = digit, a = letter, * = letter or digit. Any other
 * character is a literal that is inserted automatically.
 */

import type { DirectiveHandler } from "../types.js";

function matches(token: string, ch: string): boolean {
  if (token === "9") return /\d/.test(ch);
  if (token === "a") return /[a-zA-Z]/.test(ch);
  if (token === "*") return /[a-zA-Z0-9]/.test(ch);
  return false;
}

export function applyMask(value: string, pattern: string): string {
  let out = "";
  let ci = 0;
  for (const token of pattern) {
    if (ci >= value.length) break;
    if (token === "9" || token === "a" || token === "*") {
      while (ci < value.length) {
        const ch = value[ci++]!;
        if (matches(token, ch)) {
          out += ch;
          break;
        }
      }
    } else {
      out += token;
      if (value[ci] === token) ci++;
    }
  }
  return out;
}

export const mask: DirectiveHandler = (el, meta, utils) => {
  const input = el as HTMLInputElement;
  const pattern = String(utils.evaluate(meta.expression) ?? meta.expression);
  const format = (): void => {
    input.value = applyMask(input.value, pattern);
  };
  input.addEventListener("input", format);
  if (input.value) format();
  utils.cleanup(() => input.removeEventListener("input", format));
};
