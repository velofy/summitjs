/**
 * summitjs/net — the reactive resource.
 *
 * A resource wraps a request in Summit signals: `data`, `error`, `loading`,
 * and `status` are exposed as auto-unwrapping getters, so reading them inside a
 * directive (`s-text="user.data.name"`, `s-show="user.loading"`) subscribes the
 * DOM to exactly that field. This is the key win over a promise wrapper: the
 * view updates itself.
 *
 * It also closes the footguns the stress test found:
 *  - out-of-order responses: a monotonic sequence means the latest wins;
 *  - non-2xx: surfaces through `error` (the client already throws);
 *  - unmount leaks: `onCleanup` aborts the in-flight request;
 *  - unhandled rejections: refetch never rejects — failures land in `error`.
 */

// Import the signal factory from the public entry (not a relative core path) so
// the net bundle shares Summit's ONE reactivity runtime instead of bundling a
// second copy — otherwise resource signals would not drive the core's DOM.
import { signal } from "summitjs";
import type { NetClient, NetError, NetRequest } from "./client.js";

export type ResourceStatus = "idle" | "loading" | "success" | "error";

export interface ResourceOptions extends NetRequest {
  /** Fetch immediately on creation. Default true. */
  immediate?: boolean;
  /** Register a teardown callback (Summit passes the element's cleanup here). */
  onCleanup?: (fn: () => void) => void;
}

export interface MutateOptions {
  /** Persist the optimistic change; on rejection the previous value is restored. */
  request?: () => Promise<unknown>;
  /** Roll back on a failed request. Default true. */
  rollbackOnError?: boolean;
}

export interface Resource<T> {
  readonly data: T | undefined;
  readonly error: NetError | undefined;
  readonly loading: boolean;
  readonly status: ResourceStatus;
  /** Re-run the request (optionally overriding params/headers). Never rejects. */
  refetch(overrides?: NetRequest): Promise<T | undefined>;
  /** Optimistically set data; with `request`, roll back if the request fails. */
  mutate(next: T | ((prev: T | undefined) => T), options?: MutateOptions): void;
  /** Cancel the in-flight request and return to idle. */
  abort(): void;
}

export function createResource<T = unknown>(
  client: NetClient,
  url: string | (() => string),
  options: ResourceOptions = {},
): Resource<T> {
  const dataSig = signal<T | undefined>(undefined);
  const errorSig = signal<NetError | undefined>(undefined);
  const loadingSig = signal(false);
  const statusSig = signal<ResourceStatus>("idle");

  const { immediate, onCleanup, ...requestDefaults } = options;
  let seq = 0;
  let controller: AbortController | undefined;

  async function refetch(overrides: NetRequest = {}): Promise<T | undefined> {
    const current = ++seq;
    controller?.abort();
    controller = new AbortController();
    loadingSig.set(true);
    statusSig.set("loading");
    errorSig.set(undefined);
    try {
      const target = typeof url === "function" ? url() : url;
      const result = await client.request<T>(target, {
        ...requestDefaults,
        ...overrides,
        signal: controller.signal,
      });
      if (current !== seq) return undefined; // a newer request superseded this one
      dataSig.set(result);
      statusSig.set("success");
      return result;
    } catch (err) {
      if (current !== seq) return undefined; // stale failure, ignore
      const e = err as NetError;
      if (e.aborted) {
        statusSig.set("idle");
        return undefined;
      }
      errorSig.set(e);
      statusSig.set("error");
      return undefined;
    } finally {
      if (current === seq) loadingSig.set(false);
    }
  }

  const resource: Resource<T> = {
    get data() {
      return dataSig();
    },
    get error() {
      return errorSig();
    },
    get loading() {
      return loadingSig();
    },
    get status() {
      return statusSig();
    },
    refetch,
    mutate(next, mutateOptions = {}) {
      const previous = dataSig.peek();
      dataSig.set((prev) => (typeof next === "function" ? (next as (p: T | undefined) => T)(prev) : next));
      if (!mutateOptions.request) return;
      // Persist the optimistic change; roll back and surface the error on failure.
      void Promise.resolve()
        .then(mutateOptions.request)
        .catch((err) => {
          if (mutateOptions.rollbackOnError !== false) dataSig.set(previous);
          errorSig.set(err as NetError);
        });
    },
    abort() {
      seq++;
      controller?.abort();
      controller = undefined;
      loadingSig.set(false);
      if (statusSig.peek() === "loading") statusSig.set("idle");
    },
  };

  onCleanup?.(() => resource.abort());
  if (immediate !== false) void refetch();
  return resource;
}
