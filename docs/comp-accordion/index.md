# Accordion

> Collapsible sections, single or multiple open.

An accordion stacks sections that expand and collapse in place. Each header is a
real `<button>`, the chevron rotates through a class, and the panel below is
revealed with [s-show](../s-show/). The classic behavior is one section open at a
time, which takes a single string of state.

## One open at a time

Track which item is `open` as a string. Each trigger toggles: click the open one
and it sets `open` back to empty; click a closed one and it takes over. Because
only one value can match, opening a section closes whatever was open before.

```summit
<div class="s-accordion" s-data="{ open: 'a' }">
  <div class="s-accordion-item">
    <button class="s-accordion-trigger" :class="{ 'is-open': open === 'a' }" @click="open = open === 'a' ? '' : 'a'">
      <span>Is it accessible?</span>
      <svg class="s-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="s-accordion-panel" s-show="open === 'a'">Yes, every control is a real button.</div>
  </div>
  <div class="s-accordion-item">
    <button class="s-accordion-trigger" :class="{ 'is-open': open === 'b' }" @click="open = open === 'b' ? '' : 'b'">
      <span>Can I open many?</span>
      <svg class="s-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="s-accordion-panel" s-show="open === 'b'">Track an array instead of a single value.</div>
  </div>
</div>
```

```html
<div class="s-accordion" s-data="{ open: 'a' }">
  <div class="s-accordion-item">
    <button class="s-accordion-trigger" :class="{ 'is-open': open === 'a' }" @click="open = open === 'a' ? '' : 'a'">
      <span>Is it accessible?</span>
      <svg class="s-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="s-accordion-panel" s-show="open === 'a'">Yes, every control is a real button.</div>
  </div>
  <div class="s-accordion-item">
    <button class="s-accordion-trigger" :class="{ 'is-open': open === 'b' }" @click="open = open === 'b' ? '' : 'b'">
      <span>Can I open many?</span>
      <svg class="s-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="s-accordion-panel" s-show="open === 'b'">Track an array instead of a single value.</div>
  </div>
</div>
```

## Allowing multiple open

To let several sections stay open at once, track an array of open ids instead of
a single string. Each trigger toggles its own membership: if the id is already in
the array, `splice` it out; otherwise `push` it in. The class check and the panel
both test with `includes`.

```summit
<div class="s-accordion" s-data="{ open: ['a'] }">
  <div class="s-accordion-item">
    <button class="s-accordion-trigger" :class="{ 'is-open': open.includes('a') }" @click="open.includes('a') ? open.splice(open.indexOf('a'), 1) : open.push('a')">
      <span>Shipping</span>
      <svg class="s-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="s-accordion-panel" s-show="open.includes('a')">Orders ship within two business days.</div>
  </div>
  <div class="s-accordion-item">
    <button class="s-accordion-trigger" :class="{ 'is-open': open.includes('b') }" @click="open.includes('b') ? open.splice(open.indexOf('b'), 1) : open.push('b')">
      <span>Returns</span>
      <svg class="s-chevron" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m6 9 6 6 6-6"/></svg>
    </button>
    <div class="s-accordion-panel" s-show="open.includes('b')">Return anything within thirty days.</div>
  </div>
</div>
```

## Notes

- Every trigger is a real button, so it is keyboard reachable and toggles with
  `Enter` or `Space` without extra wiring.
- The `.s-chevron` rotates on its own through the `is-open` class in
  `components.css`; you only bind the class, never the transform.
- Start `open` at an id (or seed the array) to have a section expanded on first
  render, or set it to `''` (or `[]`) to begin fully collapsed.

For swapping between panels rather than stacking them, see
[Tabs](../comp-tabs/). The whole set is on the [overview](../components/).
