/**
 * Registers all built-in directives with their priorities.
 * Lower priority numbers run earlier on a given element.
 */

import { registerDirective } from "../registry/registry.js";
import { text, html } from "./text.js";
import { bind } from "./bind.js";
import { on } from "./on.js";
import { model } from "./model.js";
import { show } from "./show.js";
import { transition } from "./transition.js";
import { sIf } from "./conditionals.js";
import { sFor } from "./for.js";
import { teleport } from "./teleport.js";
import { init, effect, ref, id, cloak } from "./misc.js";
import { intersect, resize } from "./observe.js";
import { trap } from "./focus.js";
import { anchor } from "./anchor.js";
import { collapse } from "./collapse.js";
import { mask } from "./mask.js";

export function registerBuiltinDirectives(): void {
  registerDirective("ref", ref, 10);
  registerDirective("id", id, 15);
  registerDirective("if", sIf, 20);
  registerDirective("for", sFor, 20);
  registerDirective("teleport", teleport, 20);
  registerDirective("bind", bind, 50);
  registerDirective("mask", mask, 55);
  registerDirective("model", model, 60);
  registerDirective("on", on, 70);
  registerDirective("text", text, 80);
  registerDirective("html", html, 80);
  registerDirective("transition", transition, 85);
  registerDirective("anchor", anchor, 88);
  registerDirective("collapse", collapse, 89);
  registerDirective("show", show, 90);
  registerDirective("trap", trap, 95);
  registerDirective("effect", effect, 100);
  registerDirective("intersect", intersect, 100);
  registerDirective("resize", resize, 100);
  registerDirective("init", init, 200);
  registerDirective("cloak", cloak, 1000);
}
