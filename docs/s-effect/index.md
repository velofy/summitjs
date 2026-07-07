# s-effect

> Run a side effect that re-runs when its reactive dependencies change.

`s-effect` runs an expression as a reactive side effect. It runs once when the
element initializes, then re-runs automatically whenever any state it read
changes. Summit tracks those reads for you, so there is no dependency list to
maintain.

```summit
<div s-data="{ count: 0 }">
  <button @click="count++">Clicked <span s-text="count"></span> times</button>
  <p s-effect="document.title = 'Count: ' + count">Watch the browser tab title.</p>
</div>
```

Each click reads `count`, so Summit re-runs the effect and the tab title
updates. Re-runs are batched onto the microtask queue, so several changes in the
same tick collapse into a single run.

## When to use it

Use `s-effect` for side effects that reach outside the reactive graph: writing
to `document.title`, syncing to `localStorage`, logging, or driving a non-Summit
library. The expression runs for what it does, not for a value it returns.

To put a value on screen you do not need `s-effect`. Bind it directly with
[s-text](../s-text/) or [s-bind](../s-bind/), or derive it with a getter, and let
that directive track its own dependencies.

```summit
<div s-data="{ count: 0 }">
  <button @click="count++">+1</button>
  <p s-text="'Count is ' + count"></p>
</div>
```

Reserve `s-effect` for the cases a plain binding cannot express. To respond to
one specific value changing rather than everything an expression touches, see
[$watch](../magic-watch/). To run something once at startup with no re-runs, use
[s-init](../s-init/).
