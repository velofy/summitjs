# Lifecycle

> Run code when a component initializes, react to DOM changes automatically, and clean up when elements leave.

Summit manages a component from the moment its element appears to the moment it
leaves. You can hook into that lifecycle in three places.

## Initialization

When a component is set up, Summit calls its `init()` method if it has one. This
is the place for setup work: reading storage, starting a timer, fetching data.

```js
Summit.data("clock", () => ({
  time: "",
  init() {
    this.tick();
    setInterval(() => this.tick(), 1000);
  },
  tick() {
    this.time = new Date().toLocaleTimeString();
  },
}));
```

For a one-off expression rather than a method, use the [s-init](../s-init/)
directive:

```html
<div s-data="{ ready: false }" s-init="ready = true"></div>
```

## Reacting to changes

Most of the time you do not watch for changes yourself: any expression that
reads state re-runs when that state changes. For an explicit side effect that
should re-run on change, use [s-effect](../s-effect/):

```summit
<div s-data="{ count: 0 }">
  <button @click="count++">Add</button>
  <span s-effect="$el.style.opacity = count % 2 ? 0.5 : 1" s-text="count"></span>
</div>
```

To watch a single value and get both the new and old value, use the
[$watch](../magic-watch/) magic.

## Automatic setup for new nodes

Summit watches the document with a `MutationObserver`. Any element you add later,
whether by hand, from a fetch, or from another library, is initialized the
moment it enters the DOM. There is nothing to call and no load order to get
right.

```summit
<div s-data="{ rows: [] }">
  <button @click="rows.push('Row ' + (rows.length + 1))">Add a row</button>
  <ul>
    <template s-for="row in rows" :key="row">
      <li s-text="row"></li>
    </template>
  </ul>
</div>
```

## Cleanup

When an element is removed, Summit tears its component down and runs every
cleanup registered for it: event listeners are removed, effects are stopped,
and timers you registered through a directive are cleared. Keyed
[s-for](../s-for/) reuses nodes across updates, so state is preserved for rows
that merely moved.

## Waiting for the DOM

After you change state, the DOM updates on the next tick. To run code after that
update lands, use [$nextTick](../magic-nextTick/):

```html
<button @click="open = true; $nextTick(() => $refs.panel.focus())">Open</button>
```

## Page-level events

Summit dispatches `summit:init` on `document` just before it initializes the
page, and `summit:initialized` once it has finished. Listen for them to run code
around startup, for example to register a plugin before anything renders.
