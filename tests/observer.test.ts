import { describe, it, expect, beforeEach, afterEach } from "vitest";
import Summit from "../src/index.js";

beforeEach(() => { document.body.innerHTML = ""; });
afterEach(() => Summit.stopObserver());

/**
 * Regression: s-for that initializes AFTER page load (inside a late-flipping
 * s-if, injected HTML, or an island) used to be wiped by the MutationObserver:
 * the detached <template> looked "removed", so destroyTree ran its cleanups
 * and clear() deleted every freshly rendered row.
 */
describe("observer vs structural source nodes", () => {
  it("keeps rows rendered by a dynamically initialized s-for", async () => {
    document.body.innerHTML = `
      <div id="host" s-data="{ items: [] }">
        <table><tbody s-if="items.length">
          <template s-for="i in items" :key="i"><tr class="r"><td s-text="i"></td></tr></template>
        </tbody></table>
        <button @click="items = [1,2,3]"></button>
      </div>`;
    // Simulate post-load boot exactly like the CDN build does.
    Summit.start();
    const host = document.getElementById("host")!;
    host.querySelector("button")!.click();
    await Summit.nextTick();
    await new Promise((r) => setTimeout(r, 20)); // let observer microtasks fire

    const tds = [...host.querySelectorAll("td")].map((t) => t.textContent);
    expect(tds).toEqual(["1", "2", "3"]);
    // The inert template must remain in the DOM owning its blocks.
    expect(host.querySelector("template")).toBeTruthy();
  });

  it("still tears down genuinely removed subtrees", async () => {
    document.body.innerHTML = `
      <div id="wrap" s-data="{ show: true }">
        <section id="victim" s-if="show"><p s-text="'hi'"></p></section>
        <button @click="show = false"></button>
      </div>`;
    const wrap = document.getElementById("wrap")!;
    Summit.initTree(wrap);
    Summit.startObserver(document.body);
    await Summit.nextTick();
    expect(document.getElementById("victim")).toBeTruthy();

    wrap.querySelector("button")!.click();
    await Summit.nextTick();
    await new Promise((r) => setTimeout(r, 20));
    expect(document.getElementById("victim")).toBeNull();
  });
});
