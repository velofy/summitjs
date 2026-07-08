/**
 * summitjs/net — a tiny reactive data layer for Summit.
 *
 * Optional, shipped as its own entry so the core stays lean. Use it either
 * imperatively (`createClient`, `createResource`) or through Summit by
 * registering the plugin, which adds the `$fetch` magic and the `s-resource`
 * directive:
 *
 *   import Summit from "summitjs";
 *   import { net } from "summitjs/net";
 *   Summit.plugin(net);            // or Summit.plugin(createNet({ baseURL: "/api" }))
 *   Summit.start();
 */

import type { SummitGlobal, MagicContext } from "summitjs";
import { createClient, NetError } from "./client.js";
import type { NetClient, NetClientOptions, NetRequest, NetParams, NetInit } from "./client.js";
import { createResource } from "./resource.js";
import type { Resource, ResourceOptions, ResourceStatus, MutateOptions } from "./resource.js";
import { makeResourceDirective } from "./directive.js";

export { createClient, createResource, NetError };
export type {
  NetClient,
  NetClientOptions,
  NetRequest,
  NetParams,
  NetInit,
  Resource,
  ResourceOptions,
  ResourceStatus,
  MutateOptions,
};

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
export function createNet(options: NetClientOptions): (summit: SummitGlobal) => void {
  const client = createClient(options);
  return (summit) => register(summit, client);
}
