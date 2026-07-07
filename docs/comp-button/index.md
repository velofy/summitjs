# Button

> Buttons with solid, outline, ghost, subtle, and danger variants, plus sizes and groups.

Buttons trigger actions. Everything starts from one base class, `.s-btn`, and you
add modifiers for variant, size, and shape. Because behavior lives on the
element, you can wire any button up with the same `s-` directives you already
use.

```summit
<div s-data="{ count: 0 }" class="s-row">
  <button class="s-btn" @click="count++">Add to cart</button>
  <button class="s-btn s-btn-outline" @click="count = 0">Reset</button>
  <span s-text="count + (count === 1 ? ' item' : ' items')"></span>
</div>
```

## Variants

The base `.s-btn` is the solid, high-emphasis button. Add one modifier class to
change its emphasis. Use `.s-btn-danger` for destructive actions so the intent
reads at a glance.

```summit
<div class="s-row">
  <button class="s-btn">Solid</button>
  <button class="s-btn s-btn-outline">Outline</button>
  <button class="s-btn s-btn-ghost">Ghost</button>
  <button class="s-btn s-btn-subtle">Subtle</button>
  <button class="s-btn s-btn-danger">Danger</button>
</div>
```

## Sizes

`.s-btn-sm` and `.s-btn-lg` adjust height and padding. Without either, a button
uses the default size.

```summit
<div class="s-row">
  <button class="s-btn s-btn-sm">Small</button>
  <button class="s-btn">Default</button>
  <button class="s-btn s-btn-lg">Large</button>
</div>
```

Add `.s-btn-block` to stretch a button to the full width of its container, which
is handy at the end of a form.

## Icon buttons

`.s-btn-icon` makes a square button sized for a single glyph. Drop an inline SVG
inside and give the button an `aria-label`, since there is no visible text to
name it.

```summit
<div class="s-row">
  <button class="s-btn s-btn-icon" aria-label="Add item">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
  </button>
  <button class="s-btn s-btn-outline s-btn-icon" aria-label="Add item">
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
  </button>
  <button class="s-btn s-btn-icon s-btn-sm" aria-label="Add item">
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 5v14M5 12h14"/></svg>
  </button>
</div>
```

## Groups

Wrap two or more buttons in `.s-btn-group` to join them into a single segmented
control. The group squares off the inner corners and collapses the shared
borders for you.

```summit
<div class="s-btn-group" role="group" aria-label="Text alignment">
  <button class="s-btn s-btn-outline">Left</button>
  <button class="s-btn s-btn-outline">Center</button>
  <button class="s-btn s-btn-outline">Right</button>
</div>
```

## Disabled

The native `disabled` attribute dims a button and removes it from the tab order.
Bind it reactively with [`:disabled`](../s-bind/) to gate an action on state.

```summit
<div s-data="{ agreed: false }" class="s-row">
  <label><input type="checkbox" s-model="agreed" /> I accept the terms</label>
  <button class="s-btn" :disabled="!agreed">Continue</button>
</div>
```

## Copy and paste

```html
<button class="s-btn">Solid</button>
<button class="s-btn s-btn-outline">Outline</button>
<button class="s-btn s-btn-ghost">Ghost</button>
<button class="s-btn s-btn-subtle">Subtle</button>
<button class="s-btn s-btn-danger">Danger</button>

<button class="s-btn s-btn-sm">Small</button>
<button class="s-btn s-btn-lg">Large</button>
<button class="s-btn s-btn-block">Full width</button>

<button class="s-btn s-btn-icon" aria-label="Add">
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
</button>

<div class="s-btn-group" role="group" aria-label="Alignment">
  <button class="s-btn s-btn-outline">Left</button>
  <button class="s-btn s-btn-outline">Center</button>
  <button class="s-btn s-btn-outline">Right</button>
</div>

<button class="s-btn" disabled>Disabled</button>
```

## Accessibility

Always use a real `<button>` element so keyboard activation, focus, and the
`disabled` state work without extra code. Every variant shows a visible focus
ring on `:focus-visible`. Give icon-only buttons an `aria-label` so assistive
technology can name them, and label a `.s-btn-group` with `role="group"` and an
`aria-label` describing the set. For handling clicks and keyboard shortcuts, see
[s-on](../s-on/); to pair a button with a field, see [Input](../comp-input/).
