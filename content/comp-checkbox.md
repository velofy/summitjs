---
slug: comp-checkbox
title: Checkbox & Radio
nav: Checkbox & Radio
category: components
order: 4
description: Accessible checkboxes and radio groups bound with s-model.
---

Checkboxes and radios wrap a real `<input>` in a styled label, so you get a
custom look without giving up native behavior. The input stays in the markup and
carries the state; the `.s-box` next to it is only decoration. Bind any of them
with [s-model](../s-model/) and the checked state flows both ways.

## A single checkbox

Point `s-model` at a boolean and the checkbox toggles it. The `<input>` is
visually hidden but still present, and the `.s-box` renders the tick when the
value is `true`.

```summit
<div s-data="{ agree: false }">
  <label class="s-check">
    <input type="checkbox" s-model="agree">
    <span class="s-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
    I agree to the terms
  </label>
  <p class="s-help">agree = <span s-text="agree"></span></p>
</div>
```

```html
<label class="s-check">
  <input type="checkbox" s-model="agree">
  <span class="s-box">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
      <path d="M20 6 9 17l-5-5"/>
    </svg>
  </span>
  I agree to the terms
</label>
```

## A group bound to an array

When several checkboxes share one `s-model` and each carries a `value`, Summit
binds them to an array. Checking a box adds its value; unchecking removes it. The
order follows the order the boxes appear in the markup.

```summit
<div s-data="{ toppings: ['cheese'] }">
  <div class="s-stack">
    <label class="s-check">
      <input type="checkbox" value="cheese" s-model="toppings">
      <span class="s-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
      Cheese
    </label>
    <label class="s-check">
      <input type="checkbox" value="mushroom" s-model="toppings">
      <span class="s-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
      Mushroom
    </label>
    <label class="s-check">
      <input type="checkbox" value="olives" s-model="toppings">
      <span class="s-box"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg></span>
      Olives
    </label>
  </div>
  <p class="s-help">toppings = <span s-text="JSON.stringify(toppings)"></span></p>
</div>
```

```html
<div class="s-stack">
  <label class="s-check">
    <input type="checkbox" value="cheese" s-model="toppings">
    <span class="s-box">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3"><path d="M20 6 9 17l-5-5"/></svg>
    </span>
    Cheese
  </label>
  <!-- repeat the label for each value, all sharing s-model="toppings" -->
</div>
```

## A radio group

Radios use `.s-radio-opt`, which rounds the `.s-box` and fills it with a dot when
selected. Give every radio in the group the same `s-model` and a distinct
`value`; the model holds the one chosen value.

```summit
<div s-data="{ plan: 'pro' }">
  <div class="s-stack">
    <label class="s-radio-opt">
      <input type="radio" value="free" s-model="plan">
      <span class="s-box"></span>
      Free
    </label>
    <label class="s-radio-opt">
      <input type="radio" value="pro" s-model="plan">
      <span class="s-box"></span>
      Pro
    </label>
    <label class="s-radio-opt">
      <input type="radio" value="team" s-model="plan">
      <span class="s-box"></span>
      Team
    </label>
  </div>
  <p class="s-help">plan = <span s-text="plan"></span></p>
</div>
```

```html
<div class="s-stack">
  <label class="s-radio-opt">
    <input type="radio" value="free" s-model="plan">
    <span class="s-box"></span>
    Free
  </label>
  <label class="s-radio-opt">
    <input type="radio" value="pro" s-model="plan">
    <span class="s-box"></span>
    Pro
  </label>
</div>
```

## Accessibility

The styled box is purely visual. Because a real `<input type="checkbox">` or
`<input type="radio">` stays in the DOM, you keep native keyboard support out of
the box: focus with `Tab`, toggle a checkbox with `Space`, and move within a
radio group with the arrow keys. Screen readers announce the control's role and
checked state, and wrapping each control in its `<label>` means the visible text
is the accessible name, so no extra ARIA is needed. Grouping related radios or
checkboxes in a `<fieldset>` with a `<legend>` gives the set a shared label.

For an on/off setting, reach for the [Switch](../comp-switch/) instead. See
[Forms](../forms/) for how `s-model` handles every control type.
