import { describe, it, expect, vi, afterEach } from "vitest";
import Summit from "summitjs";
import { createClient, createResource, NetError, net } from "../src/net/index.js";

// Register the $fetch magic + s-resource directive once for the DOM tests.
Summit.plugin(net);

const tick = () => Summit.nextTick();
const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

/** A minimal Response stand-in the client can read. */
function res(status: number, body: unknown, contentType = "application/json"): Response {
  const text = typeof body === "string" ? body : JSON.stringify(body);
  return {
    ok: status >= 200 && status < 300,
    status,
    headers: { get: (k: string) => (k.toLowerCase() === "content-type" ? contentType : null) },
    text: async () => text,
  } as unknown as Response;
}

function mount(html: string): HTMLElement {
  const el = document.createElement("div");
  el.innerHTML = html;
  document.body.appendChild(el);
  Summit.initTree(el);
  return el;
}

afterEach(() => {
  vi.unstubAllGlobals();
  document.body.innerHTML = "";
});

describe("client", () => {
  it("parses JSON and applies baseURL + params + default headers", async () => {
    const seen: { url: string; init: RequestInit } = { url: "", init: {} };
    vi.stubGlobal("fetch", (url: string, init: RequestInit) => {
      seen.url = url;
      seen.init = init;
      return Promise.resolve(res(200, { ok: true }));
    });
    const client = createClient({ baseURL: "https://api.test/v1", headers: { authorization: "Bearer t" } });
    const out = await client.get("/items", { params: { q: "hi", page: 2 } });
    expect(out).toEqual({ ok: true });
    expect(seen.url).toBe("https://api.test/v1/items?q=hi&page=2");
    expect((seen.init.headers as Record<string, string>).authorization).toBe("Bearer t");
  });

  it("throws a structured NetError on non-2xx (500 is not treated as data)", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(res(500, { message: "server exploded" })));
    const client = createClient();
    await expect(client.get("/boom")).rejects.toBeInstanceOf(NetError);
    try {
      await client.get("/boom");
    } catch (e) {
      const err = e as NetError;
      expect(err.status).toBe(500);
      expect(err.body).toEqual({ message: "server exploded" });
      expect(err.aborted).toBe(false);
    }
  });

  it("sends a JSON body with content-type on POST", async () => {
    let init: RequestInit = {};
    vi.stubGlobal("fetch", (_url: string, i: RequestInit) => {
      init = i;
      return Promise.resolve(res(201, { id: 1 }));
    });
    const client = createClient();
    await client.post("/todos", { title: "buy milk" });
    expect(init.method).toBe("POST");
    expect(init.body).toBe(JSON.stringify({ title: "buy milk" }));
    expect((init.headers as Record<string, string>)["content-type"]).toBe("application/json");
  });

  it("aborts on timeout and reports it as an aborted NetError", async () => {
    vi.stubGlobal("fetch", (_url: string, i: RequestInit) => {
      return new Promise((_resolve, reject) => {
        (i.signal as AbortSignal).addEventListener("abort", () => {
          const e = new Error("aborted");
          e.name = "AbortError";
          reject(e);
        });
      });
    });
    const client = createClient();
    const err = (await client.get("/slow", { timeout: 10 }).catch((e) => e)) as NetError;
    expect(err).toBeInstanceOf(NetError);
    expect(err.aborted).toBe(true);
  });
});

describe("resource", () => {
  it("drives loading -> success and exposes data as a signal", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(res(200, [{ id: 1 }, { id: 2 }])));
    const client = createClient();
    const r = createResource<{ id: number }[]>(client, "/items");
    expect(r.loading).toBe(true);
    expect(r.status).toBe("loading");
    await tick();
    await wait(0);
    expect(r.loading).toBe(false);
    expect(r.status).toBe("success");
    expect(r.data).toHaveLength(2);
    expect(r.error).toBeUndefined();
  });

  it("latest-wins: a stale out-of-order response cannot overwrite a fresh one", async () => {
    let current = "";
    // Query "a" resolves slower (50ms) than "ab" (5ms): the classic race.
    vi.stubGlobal("fetch", (url: string) => {
      const q = new URL(url, "http://x/").searchParams.get("q");
      const delay = q === "a" ? 50 : 5;
      return new Promise((resolve) => setTimeout(() => resolve(res(200, { q })), delay));
    });
    const client = createClient();
    const r = createResource<{ q: string }>(client, () => `/search?q=${current}`, { immediate: false });
    current = "a";
    void r.refetch();
    current = "ab";
    void r.refetch();
    await wait(80);
    // Fresh "ab" wins even though "a" resolved later.
    expect(r.data).toEqual({ q: "ab" });
    expect(r.status).toBe("success");
  });

  it("surfaces non-2xx through error, never rejecting refetch", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(res(404, { message: "nope" })));
    const client = createClient();
    const r = createResource(client, "/missing", { immediate: false });
    await expect(r.refetch()).resolves.toBeUndefined(); // does not throw
    expect(r.status).toBe("error");
    expect((r.error as NetError).status).toBe(404);
  });

  it("optimistic mutate rolls back on a failed request", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(res(200, { likes: 1 })));
    const client = createClient();
    const r = createResource<{ likes: number }>(client, "/post", { immediate: false });
    r.mutate({ likes: 1 });
    r.mutate((p) => ({ likes: (p?.likes ?? 0) + 1 }), {
      request: () => Promise.reject(new Error("save failed")),
      rollbackOnError: true,
    });
    expect(r.data).toEqual({ likes: 2 }); // optimistic
    await wait(0);
    expect(r.data).toEqual({ likes: 1 }); // rolled back
  });

  it("aborts the in-flight request on cleanup", async () => {
    let aborted = false;
    vi.stubGlobal("fetch", (_url: string, i: RequestInit) => {
      (i.signal as AbortSignal).addEventListener("abort", () => {
        aborted = true;
      });
      return new Promise(() => {}); // never resolves
    });
    const client = createClient();
    const cleanups: Array<() => void> = [];
    const r = createResource(client, "/stream", { onCleanup: (fn) => cleanups.push(fn) });
    expect(r.loading).toBe(true);
    cleanups.forEach((fn) => fn()); // simulate unmount
    expect(aborted).toBe(true);
    expect(r.loading).toBe(false);
  });
});

describe("DOM integration ($fetch magic)", () => {
  it("a resource in s-data drives s-text / s-show reactively", async () => {
    vi.stubGlobal("fetch", () => Promise.resolve(res(200, [{ id: 1, name: "Ada" }, { id: 2, name: "Alan" }])));
    const el = mount(`
      <div s-data="{ users: $fetch.resource('/api/users', { immediate: true }) }">
        <span class="loading" s-text="users.loading"></span>
        <span class="count" s-text="(users.data || []).length"></span>
      </div>`);
    // Initially loading.
    expect(el.querySelector(".loading")!.textContent).toBe("true");
    await tick();
    await wait(0);
    await tick();
    // The DOM updated itself from the resolved resource signals.
    expect(el.querySelector(".loading")!.textContent).toBe("false");
    expect(el.querySelector(".count")!.textContent).toBe("2");
  });
});
