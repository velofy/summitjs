# Data Fetching

> summitjs/net, a tiny reactive data layer whose resources expose loading, error, and data as signals that drive the DOM.

Fetching data with raw `fetch` in a directive works for the simplest case, but
real screens need loading and error states, cancellation, and protection from
races. `summitjs/net` is an optional layer (about 2KB gzip, shipped separately
so the core stays small) that provides exactly that. It is the essential part of
a client like axios, but reactive: a **resource** exposes `data`, `error`,
`loading`, and `status` as signals, so the DOM updates itself.

## Install

With a bundler, register the plugin:

```js
import Summit from "summitjs";
import { net } from "summitjs/net";
Summit.plugin(net); // adds the $fetch magic and the s-resource directive
Summit.start();
```

Or drop in a second script after the core, no build step:

```html
<script src="https://velofy.github.io/summitjs/summit.min.js" defer></script>
<script src="https://velofy.github.io/summitjs/summit-net.min.js" defer></script>
```

## The resource pattern

Create a resource with `$fetch.resource(url, options)` and read its signals in
the markup. `immediate: true` fetches on creation.

```html
<div s-data="{ users: $fetch.resource('/api/users', { immediate: true }) }">
  <p s-show="users.loading">Loading…</p>
  <p s-show="users.error" s-text="users.error.message"></p>
  <ul>
    <template s-for="u in users.data || []" :key="u.id">
      <li s-text="u.name"></li>
    </template>
  </ul>
</div>
```

A resource carries:

| Member | Meaning |
| --- | --- |
| `data` | The parsed response body, or `undefined` before the first success. |
| `error` | A `NetError` (`status`, `body`, `message`), or `undefined`. |
| `loading` | `true` while a request is in flight. |
| `status` | `"idle"`, `"loading"`, `"success"`, or `"error"`. |
| `refetch(overrides?)` | Run the request again. Never rejects; failures land in `error`. |
| `mutate(next, options?)` | Set `data` optimistically, with optional rollback. |
| `abort()` | Cancel the in-flight request. |

## Search-as-you-type, races handled for you

Bind the request options to state with `s-resource`. When a value the config
reads changes, the resource refetches, and **latest-wins** cancellation means a
slow earlier response can never overwrite a newer one.

```html
<div s-data="{ q: '' }"
     s-resource:results="{ url: '/api/search', params: { q }, debounce: 200 }">
  <input s-model="q" placeholder="Search…">
  <template s-for="row in results.data || []" :key="row.id">
    <div s-text="row.title"></div>
  </template>
</div>
```

## Imperative requests

`$fetch` is also a client for one-off calls. Bodies are JSON-encoded, responses
are JSON-parsed, and a non-2xx status **throws** a `NetError` instead of quietly
resolving with the error body.

```html
<form s-data="{ title: '' }"
      @submit.prevent="$fetch.post('/api/todos', { title }).then(() => title = '')">
  <input s-model.trim="title">
  <button type="submit">Add</button>
</form>
```

## Optimistic updates

`mutate` sets `data` immediately and, when given a `request`, rolls back if it
fails.

```html
<div s-resource:todo="{ url: '/api/todos/1', immediate: true }">
  <button @click="todo.mutate(
    (t) => ({ ...t, done: !t.done }),
    { request: () => $fetch.post('/api/todos/1/toggle'), rollbackOnError: true }
  )">Toggle</button>
</div>
```

## A configured client

For a base URL, auth headers, or cross-cutting error handling, register
`createNet`. Headers can be a function so a token is read fresh per request.

```js
import { createNet } from "summitjs/net";

Summit.plugin(createNet({
  baseURL: "/api",
  headers: () => ({ authorization: "Bearer " + localStorage.token }),
  onError(e) { if (e.status === 401) location.href = "/login"; },
}));
```

The same client is available without Summit for plain scripts and tests:

```js
import { createClient } from "summitjs/net";

const api = createClient({ baseURL: "/api" });
const todo = await api.post("/todos", { title: "Ship it" });
```

## What it handles

- **Non-2xx throws.** Native `fetch` resolves on 404 and 500; here they become a
  `NetError`, so an error body never lands in `data`.
- **Latest wins.** Out-of-order responses are discarded by a per-resource
  sequence, so the freshest request always wins.
- **Abort on unmount.** A resource created in a component aborts its in-flight
  request when the element is removed.
- **No unhandled rejections.** `refetch` never rejects; failures surface through
  `error`.

## What it deliberately omits

It is not a full HTTP library. There are no adapters, no Node transport, no
upload/download progress, and no interceptor chains, just one `beforeRequest`,
one `afterResponse`, and one `onError` hook. Cancellation uses `AbortController`.
For anything heavier, use your own client and keep Summit for the view.
