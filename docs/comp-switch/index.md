# Switch

> A toggle switch bound with s-model, for on/off settings.

A switch is an on/off control for a single setting, the kind you flip and it
takes effect right away. Summit's switch is a styled `<label class="s-switch">`
wrapping a real checkbox, so binding it is exactly like binding a checkbox: point
[s-model](../s-model/) at a boolean and the track slides between states.

## A live switch

The `<input>` is visually hidden and holds the state; the `.s-track` is the
sliding pill you see. Here the switch flips `on`, and [s-show](../s-show/)
reveals a message only while it is `true`.

```summit
<div s-data="{ on: false }">
  <label class="s-switch">
    <input type="checkbox" s-model="on">
    <span class="s-track"></span>
    Email notifications
  </label>
  <p class="s-help" s-show="on">You will get an email when something changes.</p>
</div>
```

```html
<label class="s-switch">
  <input type="checkbox" s-model="on">
  <span class="s-track"></span>
  Email notifications
</label>
```

## Disabled

Add the native `disabled` attribute to the input to lock a switch. It stops
responding to clicks and keyboard input while keeping its current position, which
is useful for a setting that depends on another choice.

```summit
<div s-data="{ locked: true }">
  <label class="s-switch">
    <input type="checkbox" s-model="locked" disabled>
    <span class="s-track"></span>
    Two-factor auth (required)
  </label>
</div>
```

```html
<label class="s-switch">
  <input type="checkbox" s-model="locked" disabled>
  <span class="s-track"></span>
  Two-factor auth (required)
</label>
```

## Accessibility

Under the hood a switch is a real `<input type="checkbox">`, so it is fully
accessible with no extra work: it is reachable with `Tab`, toggles with `Space`,
and announces its checked state to screen readers. Wrapping the control in its
`<label>` makes the visible text the accessible name. If you want assistive tech
to announce it as a switch rather than a checkbox, add `role="switch"` to the
input; the checked state maps to on and off automatically.

For a set of choices rather than a single toggle, use
[Checkbox & Radio](../comp-checkbox/). See [Forms](../forms/) for the full picture
of `s-model` bindings.
