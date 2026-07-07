/**
 * Parses a raw DOM attribute name into a Summit directive descriptor.
 *
 * Grammar: `s-NAME:VALUE.MOD1.MOD2="EXPRESSION"`, with `@` shorthand for
 * `s-on:` and `:` shorthand for `s-bind:`. Attributes that are not Summit
 * directives return null.
 */

import type { DirectiveMeta } from "../types.js";

export function parseAttribute(rawName: string, expression: string): DirectiveMeta | null {
  let name = rawName;
  if (name[0] === "@") name = "on:" + name.slice(1);
  else if (name[0] === ":") name = "bind:" + name.slice(1);
  else if (name.startsWith("s-")) name = name.slice(2);
  else return null;

  const parts = name.split(".");
  const head = parts[0]!;
  const modifiers = parts.slice(1);

  const colon = head.indexOf(":");
  let dirName: string;
  let value: string | null;
  if (colon === -1) {
    dirName = head;
    value = null;
  } else {
    dirName = head.slice(0, colon);
    value = head.slice(colon + 1);
  }

  return { name: dirName, value, modifiers, expression, raw: rawName };
}

/** Is this a Summit attribute at all (by name shape)? */
export function isSummitAttribute(rawName: string): boolean {
  return rawName[0] === "@" || rawName[0] === ":" || rawName.startsWith("s-");
}
