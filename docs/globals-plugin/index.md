# Summit.plugin

> Install a plugin that registers features in bulk.

`Summit.plugin` installs a plugin: a function that registers a set of related
features in one call. It is how you package data providers, directives, magics,
stores, and binds together and share them across projects.

## Installing a plugin

Call `Summit.plugin(fn)`. Summit calls your function immediately with the
`Summit` global, so the plugin registers everything it needs through the same
API you would use by hand:

```js
function tooltips(Summit) {
  Summit.directive("tooltip", (el, meta, utils) => {
    utils.effect(() => {
      el.setAttribute("title", String(utils.evaluate(meta.expression)));
    });
  });

  Summit.magic("hint", () => (text) => text.trim());
}

Summit.plugin(tooltips);
```

A plugin is just a function, so it can register as many features as it likes:

```js
Summit.plugin((Summit) => {
  Summit
    .data("counter", () => ({ count: 0 }))
    .store("darkMode", false)
    .magic("uppercase", () => (s) => String(s).toUpperCase());
});
```

## Chaining

`Summit.plugin` returns the `Summit` global, so you can install several plugins
and keep registering:

```js
Summit
  .plugin(tooltips)
  .plugin(forms)
  .start();
```

Everything a plugin registers is timing-safe, so it does not matter whether you
install plugins before or after [Summit.start](../globals-start/). See
[Writing directives and plugins](../advanced-extending/) for the pieces a plugin
is built from.
