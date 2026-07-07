---
slug: comp-tabs
title: Tabs
nav: Tabs
category: components
order: 16
description: Switch between panels with an underlined or soft tab bar.
---

Tabs let you split related content into panels and show one at a time. There is
no widget to wire up: a tab is a real `<button>`, the active one is marked with a
class, and each panel is revealed with [s-show](../s-show/). One piece of state,
the name of the current tab, drives the whole thing.

## A live tab bar

The `.s-tabs-list` holds the buttons and draws the underline. Each `.s-tab`
clicks to set `tab` to its own name, and `:class` paints `is-active` on whichever
one matches. The panels below use `s-show` so only the current one renders.

```summit
<div s-data="{ tab: 'account' }">
  <div class="s-tabs-list" role="tablist">
    <button class="s-tab" :class="{ 'is-active': tab === 'account' }" @click="tab = 'account'">Account</button>
    <button class="s-tab" :class="{ 'is-active': tab === 'billing' }" @click="tab = 'billing'">Billing</button>
  </div>
  <div class="s-tab-panel" s-show="tab === 'account'">Manage your account.</div>
  <div class="s-tab-panel" s-show="tab === 'billing'">Update your plan.</div>
</div>
```

```html
<div s-data="{ tab: 'account' }">
  <div class="s-tabs-list" role="tablist">
    <button class="s-tab" :class="{ 'is-active': tab === 'account' }" @click="tab = 'account'">Account</button>
    <button class="s-tab" :class="{ 'is-active': tab === 'billing' }" @click="tab = 'billing'">Billing</button>
  </div>
  <div class="s-tab-panel" s-show="tab === 'account'">Manage your account.</div>
  <div class="s-tab-panel" s-show="tab === 'billing'">Update your plan.</div>
</div>
```

## Soft variant

Wrap the exact same markup in a parent with `class="s-tabs-soft"` and the
underlined bar becomes a padded pill group, with the active tab lifted onto a
raised surface. Nothing about the behavior changes; only the container class is
added.

```summit
<div class="s-tabs-soft" s-data="{ tab: 'account' }">
  <div class="s-tabs-list" role="tablist">
    <button class="s-tab" :class="{ 'is-active': tab === 'account' }" @click="tab = 'account'">Account</button>
    <button class="s-tab" :class="{ 'is-active': tab === 'billing' }" @click="tab = 'billing'">Billing</button>
  </div>
  <div class="s-tab-panel" s-show="tab === 'account'">Manage your account.</div>
  <div class="s-tab-panel" s-show="tab === 'billing'">Update your plan.</div>
</div>
```

```html
<div class="s-tabs-soft" s-data="{ tab: 'account' }">
  <div class="s-tabs-list" role="tablist">
    <button class="s-tab" :class="{ 'is-active': tab === 'account' }" @click="tab = 'account'">Account</button>
    <button class="s-tab" :class="{ 'is-active': tab === 'billing' }" @click="tab = 'billing'">Billing</button>
  </div>
  <div class="s-tab-panel" s-show="tab === 'account'">Manage your account.</div>
  <div class="s-tab-panel" s-show="tab === 'billing'">Update your plan.</div>
</div>
```

## Notes

- The current tab is just a string on `s-data`, so you can set a default by
  starting it at the tab you want open, or restore it from a URL or storage.
- Each tab is a real button, so it is reachable with `Tab` and activates with
  `Enter` or `Space` for free. Add `role="tablist"` on the list and pair panels
  with `role="tabpanel"` if you want the full ARIA tab semantics.
- Prefer `s-show` here so panel state stays in the DOM as you switch. If a panel
  is expensive and should only mount when opened, use [s-if](../s-if/) instead.

For stacked sections that expand in place rather than swap, see
[Accordion](../comp-accordion/). The whole set is on the
[overview](../components/).
