# Forms

> Bind form controls to state in both directions with s-model, covering text, numbers, checkboxes, radios, and selects.

`s-model` creates a two-way binding between a form control and a piece of state.
Type in the field and the state updates; change the state and the field follows.

```summit
<div s-data="{ name: '' }">
  <input s-model="name" placeholder="Your name" />
  <p>Hello<span s-text="name ? ', ' + name : ''"></span>.</p>
</div>
```

## Every control type

`s-model` reads and writes the right property for each kind of input, so the
same directive covers all of them.

```summit
<div s-data="{ text: 'hi', agree: true, size: 'M', picks: [] }">
  <p><input s-model="text" /> <span s-text="text"></span></p>
  <p><label><input type="checkbox" s-model="agree" /> Agree</label> <span s-text="agree"></span></p>
  <p>
    <select s-model="size"><option>S</option><option>M</option><option>L</option></select>
    <span s-text="size"></span>
  </p>
  <p>
    <label><input type="checkbox" value="a" s-model="picks" /> A</label>
    <label><input type="checkbox" value="b" s-model="picks" /> B</label>
    <span s-text="JSON.stringify(picks)"></span>
  </p>
</div>
```

- **Text, textarea, number, range**: bound to the value.
- **Checkbox**: a boolean when bound to a single control, or an array of the
  checked values when several share one model.
- **Radio**: the value of the selected control.
- **Select**: the chosen value, or an array when the select is `multiple`.

## Modifiers

| Modifier | Effect |
| --- | --- |
| `.lazy` / `.change` | Sync on `change` instead of every keystroke |
| `.blur` | Sync only when the field loses focus |
| `.number` | Coerce the value to a number |
| `.boolean` | Coerce `"true"` / `"false"` strings to a boolean |
| `.debounce` | Wait for typing to pause before syncing (default 250ms) |
| `.fill` | Seed empty state from the control's initial value |

```html
<input type="number" s-model.number="age" />
<input s-model.debounce.300ms="search" />
```

## Building custom inputs

Every element with `s-model` exposes `el._summitModel`, an object with `get` and
`set`, so a wrapper component can drive the same binding from custom controls.
The full reference is on the [s-model](../s-model/) page.
