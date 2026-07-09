/**
 * summitjs/net — a tiny reactive data layer for Summit (npm entry).
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
 *
 * CDN users load summit-net.min.js after summit.min.js instead; see cdn.ts.
 */
import { signal } from "summitjs";
import { setSignalFactory } from "./runtime.js";

// Wire the net layer to the core's reactivity runtime. `summitjs` is external in
// this build, so a bundler dedupes it to the single installed copy.
setSignalFactory(signal);

export { createClient, NetError } from "./client.js";
export type { NetClient, NetClientOptions, NetRequest, NetParams, NetInit } from "./client.js";
export { createResource } from "./resource.js";
export type { Resource, ResourceOptions, ResourceStatus, MutateOptions } from "./resource.js";
export { http, net, createNet } from "./registry.js";
export type { BoundClient } from "./registry.js";
