# Installation

> Add Summit with a single script tag, or install it from npm for use with a bundler.

Summit ships two ways: a zero-build script you drop into any page, and an npm
package for projects that use a bundler. Both give you the same runtime.

## Script tag

The fastest path. Add one tag to your `<head>` and Summit starts on its own
once the DOM is ready. Use `defer` so it runs after the document is parsed.

```html
<script src="https://cdn.jsdelivr.net/npm/summitjs/dist/summit.min.js" defer></script>
```

That is the entire setup. Any `s-` attributes already in the page come alive,
and so does anything you add later, because Summit watches the DOM for changes.

> Pin a version in production, for example `summitjs@0.1.0`, so a new release
> can never change your site without you knowing.

## npm

For projects with a build step, install the package:

```bash
npm install summitjs
```

Import the `Summit` global, register anything you need, then start it yourself.
Nothing runs until you call `start()`.

```js
import Summit from "summitjs";

Summit.data("counter", () => ({
  count: 0,
  increment() {
    this.count++;
  },
}));

Summit.start();
```

The package ships ES modules, a CommonJS build, and TypeScript types, so editor
autocomplete and type checking work out of the box.

## Content-Security-Policy

Summit never calls `eval` or `new Function`. Expressions in your markup are
parsed and interpreted by Summit itself, so a strict policy needs no
`'unsafe-eval'`:

```
Content-Security-Policy: script-src 'self'
```

Everything on this documentation site runs under exactly that constraint.

## Starting manually

The script-tag build starts automatically. If you would rather control the
moment yourself, for example to register custom directives first, call
`Summit.start()` and it will only run once:

```html
<script src="https://cdn.jsdelivr.net/npm/summitjs/dist/summit.min.js"></script>
<script>
  Summit.directive("sparkle", (el) => {
    el.style.transition = "opacity .3s";
  });
  Summit.start();
</script>
```

See [Summit.start](../globals-start/) for the details.
