/**
 * Small helpers shared across directives: class/style merging, attribute
 * application, and name casing.
 */

const BOOLEAN_ATTRS = new Set([
  "disabled",
  "checked",
  "required",
  "readonly",
  "hidden",
  "selected",
  "open",
  "multiple",
  "autofocus",
  "novalidate",
  "autoplay",
  "controls",
  "loop",
  "muted",
  "playsinline",
  "default",
  "ismap",
  "reversed",
  "async",
  "defer",
  "inert",
]);

// Attributes better set as element properties than HTML attributes.
const PROP_ATTRS = new Set(["value", "checked", "selected", "indeterminate", "muted", "volume"]);

export function camelCase(input: string): string {
  return input.replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
}

export function kebabCase(input: string): string {
  return input.replace(/[A-Z]/g, (c) => "-" + c.toLowerCase());
}

/** Turn a class binding value (string | array | object) into a token list. */
function classTokens(value: unknown): string[] {
  if (!value) return [];
  if (typeof value === "string") return value.split(/\s+/).filter(Boolean);
  if (Array.isArray(value)) return value.flatMap((v) => classTokens(v));
  if (typeof value === "object") {
    return Object.entries(value as Record<string, unknown>)
      .filter(([, on]) => on)
      .map(([cls]) => cls);
  }
  return [];
}

/** Merge static base classes with a dynamic binding, preserving both. */
export function mergeClass(base: string, value: unknown): string {
  const set = new Set<string>();
  for (const t of base.split(/\s+/)) if (t) set.add(t);
  for (const t of classTokens(value)) set.add(t);
  return [...set].join(" ");
}

/** Merge static base styles with a dynamic style object/string. */
export function mergeStyle(base: string, value: unknown): string {
  const parts: string[] = [];
  if (base) parts.push(base.trim().replace(/;?\s*$/, ""));
  if (typeof value === "string") {
    parts.push(value.trim().replace(/;?\s*$/, ""));
  } else if (value && typeof value === "object") {
    for (const [prop, val] of Object.entries(value as Record<string, unknown>)) {
      if (val == null || val === false) continue;
      parts.push(`${kebabCase(prop)}: ${String(val)}`);
    }
  }
  return parts.filter(Boolean).join("; ");
}

/** Apply a single attribute binding, handling booleans and property attrs. */
export function applyAttribute(el: Element, name: string, value: unknown): void {
  if (BOOLEAN_ATTRS.has(name)) {
    if (value) el.setAttribute(name, "");
    else el.removeAttribute(name);
    // Reflect to the property too, so form state stays in sync.
    if (name in el) (el as unknown as Record<string, unknown>)[name] = !!value;
    return;
  }
  if (PROP_ATTRS.has(name) && name in el) {
    (el as unknown as Record<string, unknown>)[name] = value;
    return;
  }
  if (value === false || value == null) {
    el.removeAttribute(name);
  } else {
    el.setAttribute(name, String(value));
  }
}
