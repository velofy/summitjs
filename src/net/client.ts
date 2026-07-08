/**
 * summitjs/net — the HTTP client.
 *
 * A thin, dependency-free wrapper over `fetch` that fixes fetch's real-world
 * footguns: it throws a structured error on non-2xx, sends and parses JSON
 * automatically, serializes params, supports a baseURL, default headers,
 * per-request timeout, and cancellation. No eval, no codegen, so it stays
 * CSP-safe like the rest of Summit.
 */

/** A structured error thrown for non-2xx responses, timeouts, and aborts. */
export class NetError extends Error {
  status: number;
  body: unknown;
  url: string;
  method: string;
  aborted: boolean;

  constructor(
    message: string,
    init: { status: number; body: unknown; url: string; method: string; aborted: boolean },
  ) {
    super(message);
    this.name = "NetError";
    this.status = init.status;
    this.body = init.body;
    this.url = init.url;
    this.method = init.method;
    this.aborted = init.aborted;
  }
}

export type NetParams = Record<string, string | number | boolean | null | undefined>;

export interface NetRequest {
  method?: string;
  headers?: Record<string, string>;
  params?: NetParams;
  /** A value: objects/arrays are JSON-encoded; strings are sent as-is. */
  body?: unknown;
  /** Abort this request when the given signal aborts. */
  signal?: AbortSignal;
  /** Abort automatically after this many milliseconds. */
  timeout?: number;
}

export interface NetClientOptions {
  baseURL?: string;
  /** Static headers, or a function evaluated per request (e.g. for auth tokens). */
  headers?: Record<string, string> | (() => Record<string, string>);
  timeout?: number;
  /** Inspect or replace the request just before it is sent. */
  beforeRequest?: (req: NetInit) => void | NetInit;
  /** Inspect or replace the response before the body is read. */
  afterResponse?: (res: Response) => void | Response;
  /** Called with every NetError (e.g. redirect on 401). Re-throws afterward. */
  onError?: (err: NetError) => void;
}

export type NetInit = RequestInit & { url: string };

export interface NetClient {
  request<T = unknown>(path: string, options?: NetRequest): Promise<T>;
  get<T = unknown>(path: string, options?: NetRequest): Promise<T>;
  post<T = unknown>(path: string, body?: unknown, options?: NetRequest): Promise<T>;
  put<T = unknown>(path: string, body?: unknown, options?: NetRequest): Promise<T>;
  patch<T = unknown>(path: string, body?: unknown, options?: NetRequest): Promise<T>;
  delete<T = unknown>(path: string, options?: NetRequest): Promise<T>;
  /** The client's live defaults; mutate to reconfigure baseURL/headers at runtime. */
  options: NetClientOptions;
}

export function createClient(defaults: NetClientOptions = {}): NetClient {
  async function request<T = unknown>(path: string, req: NetRequest = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutMs = req.timeout ?? defaults.timeout;
    const timer = timeoutMs ? setTimeout(() => controller.abort(), timeoutMs) : undefined;
    // Chain an external signal onto our controller so both timeout and the
    // caller's own cancellation abort the same request.
    if (req.signal) {
      if (req.signal.aborted) controller.abort();
      else req.signal.addEventListener("abort", () => controller.abort(), { once: true });
    }

    const method = (req.method ?? "GET").toUpperCase();
    const url = withParams(joinURL(defaults.baseURL, path), req.params);
    const baseHeaders = typeof defaults.headers === "function" ? defaults.headers() : defaults.headers;
    const headers: Record<string, string> = { ...baseHeaders, ...req.headers };

    let init: NetInit = { url, method, headers, signal: controller.signal };
    if (req.body !== undefined && method !== "GET" && method !== "HEAD") {
      if (!hasHeader(headers, "content-type") && typeof req.body !== "string") {
        headers["content-type"] = "application/json";
      }
      init.body = typeof req.body === "string" ? req.body : JSON.stringify(req.body);
    }

    const patched = defaults.beforeRequest?.(init);
    if (patched) init = patched;

    try {
      let res = await fetch(init.url, init);
      const swapped = defaults.afterResponse?.(res);
      if (swapped) res = swapped;
      const body = await readBody(res);
      if (!res.ok) {
        throw new NetError(`Request failed with status ${res.status}`, {
          status: res.status,
          body,
          url: init.url,
          method,
          aborted: false,
        });
      }
      return body as T;
    } catch (err) {
      const e = normalizeError(err, init.url, method);
      defaults.onError?.(e);
      throw e;
    } finally {
      if (timer) clearTimeout(timer);
    }
  }

  const client: NetClient = {
    request,
    get: (path, options) => request(path, { ...options, method: "GET" }),
    post: (path, body, options) => request(path, { ...options, method: "POST", body }),
    put: (path, body, options) => request(path, { ...options, method: "PUT", body }),
    patch: (path, body, options) => request(path, { ...options, method: "PATCH", body }),
    delete: (path, options) => request(path, { ...options, method: "DELETE" }),
    options: defaults,
  };
  return client;
}

function normalizeError(err: unknown, url: string, method: string): NetError {
  if (err instanceof NetError) return err;
  const aborted = (err as { name?: string })?.name === "AbortError";
  return new NetError(aborted ? "Request aborted" : (err as Error)?.message ?? "Network request failed", {
    status: 0,
    body: undefined,
    url,
    method,
    aborted,
  });
}

async function readBody(res: Response): Promise<unknown> {
  const type = res.headers.get("content-type") ?? "";
  const text = await res.text();
  if (text === "") return undefined;
  if (type.includes("application/json") || type.includes("+json")) {
    try {
      return JSON.parse(text);
    } catch {
      return text; // malformed JSON: hand back the raw text rather than throwing
    }
  }
  return text;
}

function hasHeader(headers: Record<string, string>, name: string): boolean {
  const lower = name.toLowerCase();
  return Object.keys(headers).some((k) => k.toLowerCase() === lower);
}

function joinURL(base: string | undefined, path: string): string {
  if (!base || /^[a-z][a-z0-9+.-]*:\/\//i.test(path)) return path;
  return `${base.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

function withParams(url: string, params?: NetParams): string {
  if (!params) return url;
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value != null) query.set(key, String(value));
  }
  const suffix = query.toString();
  if (!suffix) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${suffix}`;
}
