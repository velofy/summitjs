---
slug: magic-persist
title: $persist
nav: $persist
category: magics
order: 20
description: Reactive state backed by localStorage that survives reloads.
---

`$persist` makes a piece of state stick around. Wrap a default value with it in
your `s-data`, and Summit seeds the value from `localStorage`, then writes it
back on every change. Reload the page and the value is still there.

```summit
<div s-data="{ count: $persist(0) }">
  <button class="s-btn" @click="count++">Clicked <span s-text="count"></span> times</button>
  <p style="color:var(--muted)">Reload the page: the count stays.</p>
</div>
```

The storage key defaults to the property name, so `count` above is saved under
`"count"`.

## Choosing the key

When two components both persist a `count`, give them distinct keys with `.as()`
so they do not overwrite each other.

```html
<div s-data="{ count: $persist(0).as('cart-count') }"></div>
```

## What you can store

`$persist` serializes with `JSON`, so strings, numbers, booleans, arrays, and
plain objects all work. The value stays fully reactive after it is restored, so
everything that reads it updates as usual.

```html
<div s-data="{ prefs: $persist({ theme: 'dark', density: 'cozy' }) }"></div>
```

If storage is unavailable (private mode, disabled), `$persist` quietly falls
back to the default value so your component still runs.
