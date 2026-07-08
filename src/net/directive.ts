/**
 * summitjs/net — the `s-resource` directive.
 *
 *   <div s-resource:users="{ url: '/api/users', immediate: true }">
 *     <p s-show="users.loading">Loading…</p>
 *     <p s-show="users.error" s-text="users.error.message"></p>
 *     <template s-for="u in users.data || []" :key="u.id"><li s-text="u.name"></li></template>
 *   </div>
 *
 * The config expression is evaluated reactively: when a value it reads changes
 * (e.g. a `params: { q }` bound to state), the resource refetches with the new
 * params, and latest-wins cancellation makes stale responses harmless. An
 * optional `debounce` throttles those refetches for search-as-you-type.
 */

import type { DirectiveHandler } from "summitjs";
import { createResource, type Resource } from "./resource.js";
import type { NetClient, NetParams } from "./client.js";

interface ResourceConfig {
  url?: string;
  params?: NetParams;
  headers?: Record<string, string>;
  method?: string;
  body?: unknown;
  immediate?: boolean;
  debounce?: number;
  timeout?: number;
}

export function makeResourceDirective(client: NetClient): DirectiveHandler {
  return (el, meta, utils) => {
    const name = meta.value;
    if (!name) {
      console.warn("[summit] s-resource needs a name, e.g. s-resource:users=\"{ url: '/api/users' }\".", el);
      return;
    }

    const scope = utils.scopes[utils.scopes.length - 1] as Record<string, unknown> | undefined;
    let resource: Resource<unknown> | undefined;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const readConfig = (): ResourceConfig => (utils.evaluate(meta.expression) || {}) as ResourceConfig;

    utils.effect(() => {
      const cfg = readConfig(); // subscribes to reactive params (q, page, …)
      if (!cfg.url) return;
      const req = { params: cfg.params, headers: cfg.headers, method: cfg.method, body: cfg.body, timeout: cfg.timeout };

      if (!resource) {
        resource = createResource(client, () => readConfig().url ?? cfg.url!, {
          ...req,
          immediate: cfg.immediate !== false,
          onCleanup: utils.cleanup,
        });
        if (scope) scope[name] = resource;
        return;
      }

      // Config changed after creation: refetch with the new request options,
      // debounced when asked. Latest-wins means out-of-order replies are safe.
      const run = () => resource!.refetch(req);
      if (cfg.debounce) {
        if (timer) clearTimeout(timer);
        timer = setTimeout(run, cfg.debounce);
      } else {
        run();
      }
    });

    utils.cleanup(() => {
      if (timer) clearTimeout(timer);
    });
  };
}
