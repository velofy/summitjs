# $data

> The current component's reactive state object.

`$data` is the current component's reactive state object, the same object you
declared with `s-data`. Most of the time you read state by name, but when you
need the whole object at once, `$data` hands it to you. Reads and writes through
it stay reactive.

```summit
<div s-data="{ name: 'Ada', role: 'admin' }">
  <p s-text="JSON.stringify($data)"></p>
  <button @click="$data.name = 'Grace'">Rename</button>
</div>
```

Writing `$data.name` updates the same state as writing `name`, so the text above
re-renders. `$data` is just the state object itself, reached as a value.

## When to use it

Reach for `$data` when you want to work with the state as an object rather than
by individual names, for example to serialize it, iterate its keys, pass it to a
helper, or reset it in one assignment.

```html
<button @click="Object.keys($data).forEach(k => $data[k] = '')">Clear all</button>
```

## Which component

`$data` is the state of the nearest component. In
[nested components](../reactivity-state/) the inner `s-data` wins, so `$data`
inside a child gives the child's state, not the parent's. To reach shared state
across components, use [$store](../magic-store/) instead.
