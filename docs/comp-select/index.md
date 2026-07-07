# Select

> A styled native select bound with s-model.

Select lets you pick one value from a fixed list. Apply `.s-select` to a real
`<select>` element and bind it with [`s-model`](../forms/), so the chosen option
flows straight into your state.

```summit
<div s-data="{ plan: 'pro' }" class="s-stack">
  <div class="s-field">
    <label class="s-label" for="plan-1">Plan</label>
    <select class="s-select" id="plan-1" s-model="plan">
      <option value="free">Free</option>
      <option value="pro">Pro</option>
      <option value="team">Team</option>
    </select>
  </div>
  <p class="s-help">Selected plan: <span s-text="plan"></span></p>
</div>
```

## Driving other state

Because the value is just a piece of your data, you can react to it anywhere.
Here the choice reveals a note with [`s-show`](../s-show/).

```summit
<div s-data="{ size: 'M' }" class="s-stack">
  <div class="s-field">
    <label class="s-label" for="size-1">T-shirt size</label>
    <select class="s-select" id="size-1" s-model="size">
      <option>S</option>
      <option>M</option>
      <option>L</option>
      <option>XL</option>
    </select>
  </div>
  <p class="s-help" s-show="size === 'XL'">XL adds $2 to the price.</p>
</div>
```

## A real native select

`.s-select` styles the browser's own `<select>`. It only restyles the closed
control, so the open list stays the native menu. That is deliberate: you keep the
platform's keyboard handling, type-ahead search, and the correct picker on touch
devices for free, and there is no custom widget to maintain.

## Copy and paste

```html
<div class="s-field">
  <label class="s-label" for="country">Country</label>
  <select class="s-select" id="country" s-model="country">
    <option value="">Choose a country</option>
    <option value="us">United States</option>
    <option value="ca">Canada</option>
    <option value="uk">United Kingdom</option>
  </select>
</div>
```

## Accessibility

Since this is a real `<select>`, screen readers, keyboard navigation, and mobile
pickers all work with no extra wiring. Pair it with a `<label>` by matching the
label's `for` to the select's `id`, or use the [$id](../magic-id/) magic when the
id is generated at runtime. For binding, coercion modifiers, and `multiple`
selects, see [Forms](../forms/) and [s-model](../s-model/); for free-text entry,
see [Input](../comp-input/).
