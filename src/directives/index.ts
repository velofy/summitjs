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

export function registerBuiltinDirectives(): void {
  registerDirective("ref", ref, 10);
  registerDirective("id", id, 15);
  registerDirective("if", sIf, 20);
  registerDirective("for", sFor, 20);
  registerDirective("teleport", teleport, 20);
  registerDirective("bind", bind, 50);
  registerDirective("model", model, 60);
  registerDirective("on", on, 70);
  registerDirective("text", text, 80);
  registerDirective("html", html, 80);
  registerDirective("transition", transition, 85);
  registerDirective("show", show, 90);
  registerDirective("effect", effect, 100);
  registerDirective("init", init, 200);
  registerDirective("cloak", cloak, 1000);
}
