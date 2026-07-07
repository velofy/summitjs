# Summit.start

> Start Summit and initialize the DOM.

`Summit.start` scans the DOM, brings every `s-` attribute to life, and begins
watching for elements added later. The script-tag build calls it for you. The
npm build leaves the timing to you, so you can register your data, directives,
and magics first.

## Starting

Call `Summit.start()` to initialize the whole document, or pass a root element to
initialize just that subtree:

```js
Summit.start();
```

```js
Summit.start(document.getElementById("app"));
```

When no root is given, Summit starts from `document.body`. After the initial
pass it keeps a watcher on the document, so any `s-` markup you add later comes
alive on its own and torn-down elements are cleaned up.

## It runs once

`Summit.start` is idempotent. The first call initializes the DOM; later calls
return immediately and do nothing. That makes it safe to call after registering
features without worrying about double-initialization:

```js
Summit.directive("sparkle", (el) => {
  el.style.transition = "opacity .3s";
});
Summit.start();
```

The script-tag build already calls `start()` once the DOM is ready, so calling
it again yourself is harmless.

## Lifecycle events

`start` dispatches two events on `document`, so you can hook into
initialization:

- `summit:init` fires just before Summit walks the DOM.
- `summit:initialized` fires after the initial pass completes.

```js
document.addEventListener("summit:initialized", () => {
  console.log("Summit is running");
});
```

## Checking status and version

`Summit.started()` returns `true` once `start` has run, and `false` before:

```js
if (!Summit.started()) Summit.start();
```

`Summit.version` is the version string of the running build:

```js
console.log(Summit.version); // "0.1.0"
```

For install options and manual-start setup, see
[Installation](../installation/).
