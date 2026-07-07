/**
 * s-model: two-way binding for form controls.
 *
 * Handles text, textarea, number, range, checkbox (boolean or array), radio,
 * and select (single or multiple). Modifiers: .lazy .change .blur .number
 * .boolean .debounce .throttle .fill. The bound value is also exposed as
 * `el._summitModel = { get, set }` for building custom input components.
 */

import type { DirectiveHandler } from "../types.js";

function coerce(value: string, mods: string[]): unknown {
  if (mods.includes("number")) {
    const n = parseFloat(value);
    return isNaN(n) ? value : n;
  }
  if (mods.includes("boolean")) {
    if (value === "true") return true;
    if (value === "false") return false;
    return Boolean(value);
  }
  return value;
}

function debounce(fn: () => void, ms: number): () => void {
  let t: ReturnType<typeof setTimeout> | undefined;
  return () => {
    clearTimeout(t);
    t = setTimeout(fn, ms);
  };
}

function durationFor(mods: string[], name: string): number | null {
  const i = mods.indexOf(name);
  if (i === -1) return null;
  const next = mods[i + 1];
  if (next && /^\d+(ms|s)?$/.test(next)) {
    return next.endsWith("s") && !next.endsWith("ms") ? parseInt(next, 10) * 1000 : parseInt(next, 10);
  }
  return 250;
}

export const model: DirectiveHandler = (el, meta, utils) => {
  const input = el as HTMLInputElement;
  const select = el as HTMLSelectElement;
  const mods = meta.modifiers;
  const expr = meta.expression;
  const type = input.type;
  const tag = el.tagName;

  const getValue = (): unknown => utils.evaluate(expr);
  const setValue = (v: unknown): void => {
    utils.evaluateAction(expr + " = $model", { $model: v });
  };

  // .fill: seed the model from the control's initial value if the model is empty.
  if (mods.includes("fill")) {
    const current = getValue();
    if (current === undefined || current === null || current === "") {
      setValue(coerce(input.value ?? input.getAttribute("value") ?? "", mods));
    }
  }

  const readFromElement = (): unknown => {
    if (type === "checkbox") {
      const current = getValue();
      if (Array.isArray(current)) {
        const next = new Set(current as unknown[]);
        if (input.checked) next.add(input.value);
        else next.delete(input.value);
        return [...next];
      }
      return input.checked;
    }
    if (type === "radio") {
      return coerce(input.value, mods);
    }
    if (tag === "SELECT" && select.multiple) {
      return Array.from(select.selectedOptions).map((o) => o.value);
    }
    return coerce(input.value, mods);
  };

  const writeToElement = (value: unknown): void => {
    if (type === "checkbox") {
      input.checked = Array.isArray(value) ? (value as unknown[]).map(String).includes(input.value) : !!value;
      return;
    }
    if (type === "radio") {
      input.checked = String(value) === input.value;
      return;
    }
    if (tag === "SELECT" && select.multiple) {
      const set = new Set((value as unknown[] | null)?.map(String) ?? []);
      for (const opt of Array.from(select.options)) opt.selected = set.has(opt.value);
      return;
    }
    const str = value == null ? "" : String(value);
    if (input.value !== str) input.value = str;
  };

  // Keep the element in sync with the data.
  utils.effect(() => writeToElement(getValue()));

  // Keep the data in sync with the element.
  let eventName = "input";
  if (tag === "SELECT" || type === "checkbox" || type === "radio") eventName = "change";
  if (mods.includes("lazy") || mods.includes("change")) eventName = "change";
  if (mods.includes("blur")) eventName = "blur";

  let onEvent = (): void => setValue(readFromElement());
  const debounceMs = durationFor(mods, "debounce");
  if (debounceMs != null) onEvent = debounce(onEvent, debounceMs);

  el.addEventListener(eventName, onEvent);
  utils.cleanup(() => el.removeEventListener(eventName, onEvent));

  (el as unknown as { _summitModel: { get: () => unknown; set: (v: unknown) => void } })._summitModel = {
    get: getValue,
    set: setValue,
  };
};
