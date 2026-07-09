/**
 * summitjs/net — plugin registration.
 *
 * Shared by both the npm entry (index.ts) and the CDN drop-in (cdn.ts). It only
 * *type*-imports from "summitjs", so it carries no runtime dependency on the
 * core — the CDN build can bundle it into a self-contained IIFE that reads the
 * core off the global instead.
 */
import type { SummitGlobal, MagicContext } from "summitjs";
import { createClient } from "./client.js";
import type { NetClient } from "./client.js";
import { createResource } from "./resource.js";
import type { Resource, ResourceOptions } from "./resource.js";
import { makeResourceDirective } from "./directive.js";

/** The default client shared by the `$fetch` magic and `s-resource` directive. */
export const http: NetClient = createClient();

/** A client bound to an element: resources it creates auto-abort on unmount. */
export interface BoundClient extends NetClient {
  resource<T = unknown>(url: string | (() => string), options?: ResourceOptions): Resource<T>;
}

function bindClient(client: NetClient, ctx: MagicContext): BoundClient {
  return {
    ...client,
    resource(url, options = {}) {
      return createResource(client, url, { ...options, onCleanup: options.onCleanup ?? ctx.cleanup });
    },
  };
}

function register(summit: SummitGlobal, client: NetClient): void {
  summit.magic("fetch", (ctx) => bindClient(client, ctx as MagicContext));
  summit.directive("resource", makeResourceDirective(client));
}

/** Ready-to-use plugin backed by the default client: `Summit.plugin(net)`. */
export function net(summit: SummitGlobal): void {
  register(summit, http);
}

/** A configured plugin: `Summit.plugin(createNet({ baseURL: "/api" }))`. */
export function createNet(options: import("./client.js").NetClientOptions): (summit: SummitGlobal) => void {
  const client = createClient(options);
  return (summit) => register(summit, client);
}
