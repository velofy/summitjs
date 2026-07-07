---
slug: comp-toast
title: Toast
nav: Toast
category: components
order: 15
description: Transient notifications that stack and auto-dismiss.
---

A toast is a short, transient notification that slides into a corner to confirm
an action or report a result, then clears itself after a moment. Toasts stack in
a fixed `.s-toast-viewport` so several can show at once, newest below the last.
Each one is a `.s-toast` you render from an array with [s-for](../s-for/), which
means adding and removing entries is all it takes to raise and clear them.

## A live toast

The state is an array of toasts. The `add()` method pushes a new entry with a
unique id from `Date.now()`, then schedules `dismiss(id)` with `setTimeout` so
the toast clears itself after three seconds. Manual dismissal calls the same
`dismiss()`, which filters the entry out of the array.

```summit
<div s-data="{ toasts: [], add() { const id = Date.now(); this.toasts.push({ id: id, title: 'Saved', desc: 'Your changes are live.' }); setTimeout(() => this.dismiss(id), 3000); }, dismiss(id) { this.toasts = this.toasts.filter(t => t.id !== id); } }">
  <button class="s-btn" @click="add()">Show toast</button>
  <div class="s-toast-viewport">
    <template s-for="t in toasts" :key="t.id">
      <div class="s-toast s-toast-success">
        <div><p class="s-toast-title" s-text="t.title"></p><p class="s-toast-desc" s-text="t.desc"></p></div>
        <button class="s-btn s-btn-ghost s-btn-icon s-btn-sm" @click="dismiss(t.id)" aria-label="Dismiss">&times;</button>
      </div>
    </template>
  </div>
</div>
```

```html
<div s-data="{
  toasts: [],
  add() {
    const id = Date.now();
    this.toasts.push({ id: id, title: 'Saved', desc: 'Your changes are live.' });
    setTimeout(() => this.dismiss(id), 3000);
  },
  dismiss(id) {
    this.toasts = this.toasts.filter(t => t.id !== id);
  }
}">
  <button class="s-btn" @click="add()">Show toast</button>
  <div class="s-toast-viewport">
    <template s-for="t in toasts" :key="t.id">
      <div class="s-toast s-toast-success">
        <div>
          <p class="s-toast-title" s-text="t.title"></p>
          <p class="s-toast-desc" s-text="t.desc"></p>
        </div>
        <button class="s-btn s-btn-ghost s-btn-icon s-btn-sm" @click="dismiss(t.id)" aria-label="Dismiss">&times;</button>
      </div>
    </template>
  </div>
</div>
```

## Auto-dismiss and manual dismiss

Every toast gets a `setTimeout(() => this.dismiss(id), 3000)` when it is added,
so it disappears on its own after three seconds. The close button on each toast
calls the same `dismiss(id)`, letting the user clear it early. Because both paths
filter by the toast's id, dismissing one never disturbs the others still on
screen. Change the timeout to hold toasts longer, or drop it for a toast the user
must close by hand.

## Success and danger variants

The left border of a toast carries its meaning. The base `.s-toast` uses the
accent color; add `.s-toast-success` for a confirmation or `.s-toast-danger` for
an error. Here `add(type)` picks the class and the copy from the kind of toast
you asked for.

```summit
<div s-data="{ toasts: [], add(type) { const id = Date.now(); const ok = type === 'success'; this.toasts.push({ id: id, cls: ok ? 's-toast-success' : 's-toast-danger', title: ok ? 'Saved' : 'Upload failed', desc: ok ? 'Your changes are live.' : 'The file was too large.' }); setTimeout(() => this.dismiss(id), 3000); }, dismiss(id) { this.toasts = this.toasts.filter(t => t.id !== id); } }">
  <div class="s-row">
    <button class="s-btn s-btn-outline" @click="add('success')">Success toast</button>
    <button class="s-btn s-btn-outline" @click="add('danger')">Danger toast</button>
  </div>
  <div class="s-toast-viewport">
    <template s-for="t in toasts" :key="t.id">
      <div class="s-toast" :class="t.cls">
        <div><p class="s-toast-title" s-text="t.title"></p><p class="s-toast-desc" s-text="t.desc"></p></div>
        <button class="s-btn s-btn-ghost s-btn-icon s-btn-sm" @click="dismiss(t.id)" aria-label="Dismiss">&times;</button>
      </div>
    </template>
  </div>
</div>
```

```html
<div class="s-toast" :class="t.cls">
  <div>
    <p class="s-toast-title" s-text="t.title"></p>
    <p class="s-toast-desc" s-text="t.desc"></p>
  </div>
  <button class="s-btn s-btn-ghost s-btn-icon s-btn-sm" @click="dismiss(t.id)" aria-label="Dismiss">&times;</button>
</div>
```

## Notes

The examples keep the toast list in local `s-data` so each is self-contained, but
in a real app you want one viewport and a single list that any component can add
to. Move the array and its `add()` and `dismiss()` methods into a global
[Summit.store](../globals-store/), render the viewport once near the root, and
raise a toast from anywhere with `$store.toasts.add(...)`. That way a save button
in one corner and a form in another share the same stack instead of each managing
its own.

The `.s-toast-viewport` is `position: fixed`, so it floats above the page no
matter where it sits in the markup. Keep the `:key="t.id"` on the `s-for` so
Summit tracks each toast by identity as the array changes, which keeps
auto-dismiss and manual dismiss from removing the wrong one. For a persistent,
inline message rather than a transient one, use an [Alert](../comp-alert/)
instead.
