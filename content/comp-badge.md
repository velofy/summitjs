---
slug: comp-badge
title: Badge & Tag
nav: Badge & Tag
category: components
order: 7
description: Small status labels and removable tags.
---

Badges are small, uppercase labels for status and counts: a build that passed, a
plan tier, an item count on a menu. Tags are their rounded, softer cousin, sized
for user-entered keywords and built to carry a remove button. Both are plain
markup, and the tag's button is where a little Summit state turns a static list
into an editable one.

```summit
<div class="s-row">
  <span class="s-badge">Default</span>
  <span class="s-badge s-badge-solid">Solid</span>
  <span class="s-badge s-badge-outline">Outline</span>
  <span class="s-badge s-badge-info">Info</span>
  <span class="s-badge s-badge-success">Success</span>
  <span class="s-badge s-badge-warning">Warning</span>
  <span class="s-badge s-badge-danger">Danger</span>
</div>
```

## Badge variants

The base `.s-badge` uses your accent tint. Add one modifier to change its weight
or meaning:

- `.s-badge-solid` fills with the accent color for the strongest emphasis.
- `.s-badge-outline` is a quiet, bordered label.
- `.s-badge-info`, `.s-badge-success`, `.s-badge-warning`, and `.s-badge-danger`
  map to the semantic feedback palette, the same colors the
  [alert](../comp-alert/) component uses.

```html
<span class="s-badge s-badge-success">Passing</span>
<span class="s-badge s-badge-danger">3 failed</span>
<span class="s-badge s-badge-outline">Draft</span>
```

## Removable tags

A `.s-tag` is a pill with an inner `<button>` for removal. Bind the list to state
with [s-for](../s-for/), key each tag, and let the button `splice` its own item
out of the array. Because the array is reactive, the tag disappears the moment
you click.

```summit
<div s-data="{ tags: ['Design', 'Research', 'Docs', 'Frontend'] }">
  <div class="s-row">
    <template s-for="(tag, i) in tags" :key="tag">
      <span class="s-tag">
        <span s-text="tag"></span>
        <button @click="tags.splice(i, 1)" aria-label="Remove tag">&times;</button>
      </span>
    </template>
    <span s-show="tags.length === 0" class="s-help">All tags removed.</span>
  </div>
</div>
```

## Copy

```html
<div s-data="{ tags: ['Design', 'Research', 'Docs'] }">
  <div class="s-row">
    <template s-for="(tag, i) in tags" :key="tag">
      <span class="s-tag">
        <span s-text="tag"></span>
        <button @click="tags.splice(i, 1)" aria-label="Remove tag">&times;</button>
      </span>
    </template>
  </div>
</div>
```

## Notes

- Give the remove button an `aria-label` so screen readers announce what it does,
  since the visible content is just a times sign.
- The `:key="tag"` keeps each pill matched to its value across removals, so the
  right one leaves even when earlier tags are gone. Use a unique id if your tags
  can repeat.
- Badges have no interactive behavior; they are labels. For dismissible banners,
  reach for an [alert](../comp-alert/) or a toast instead.

See the whole component set on the [overview](../components/).
