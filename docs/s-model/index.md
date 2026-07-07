# s-model

> Two-way binding for form controls.

`s-model` wires a form control to a piece of state in both directions. When the
user changes the control, the state updates; when the state changes from
anywhere else, the control updates to match. It replaces the pair of an
[s-bind](../s-bind/) on `value` and an [s-on](../s-on/) input listener that you
would otherwise write by hand.

```summit
<div s-data="{ name: '' }">
  <input s-model="name" placeholder="Your name" />
  <p>Hello<span s-text="name ? ', ' + name : ''"></span>.</p>
</div>
```

## How it stays in sync

Two things run under the hood. A reactive effect writes the current state into
the control whenever the state changes, and an event listener reads the control
back into the state whenever the user interacts with it. The read and write both
know which property matters for the element, so the same directive covers every
control type.

The listener defaults to the `input` event for text-like fields and switches to
`change` for `select`, `checkbox`, and `radio` elements.

## Every control type

`s-model` inspects the element and picks the right value to read and write:

- **Text, textarea, number, range**: bound to the control's value.
- **Checkbox**: a boolean when one checkbox is bound on its own, or an array of
  the checked controls' `value` attributes when several checkboxes share the same
  model.
- **Radio**: the `value` of the selected control in the group.
- **Select**: the chosen option's value, or an array of selected values when the
  `select` has the `multiple` attribute.

```summit
<div s-data="{ text: 'hi', qty: 1, agree: true, size: 'M', picks: [] }">
  <p><input s-model="text" /> <span s-text="text"></span></p>
  <p><input type="number" s-model.number="qty" /> <span s-text="qty + 1"></span></p>
  <p><label><input type="checkbox" s-model="agree" /> Agree</label> <span s-text="String(agree)"></span></p>
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

## Modifiers

| Modifier | Effect |
| --- | --- |
| `.lazy` / `.change` | Sync on the `change` event instead of on every keystroke |
| `.blur` | Sync only when the control loses focus |
| `.number` | Coerce the read value with `parseFloat`, keeping the string if it is not a number |
| `.boolean` | Coerce the strings `"true"` and `"false"` to real booleans, otherwise fall back to a truthiness check |
| `.debounce` | Wait until edits pause before syncing state (default 250ms) |
| `.fill` | Seed empty state from the control's initial value on setup |

`.number` and `.boolean` apply when the value is read from text-like fields,
radios, and single selects.

`.debounce` defaults to 250ms and takes a custom duration as the next modifier,
the same as it does on [s-on](../s-on/): `ms` is milliseconds, `s` is seconds.

```html
<input type="number" s-model.number="age" />
<input s-model.debounce.300ms="search" />
<input s-model.lazy="title" />
```

### Filling from markup

`.fill` is useful when the initial value lives in the HTML rather than in
`s-data`. On setup, if the bound state is `undefined`, `null`, or an empty
string, `s-model.fill` reads the control's current value (running it through any
`.number` or `.boolean` coercion) and seeds the state with it.

```html
<input s-model.fill="color" value="#3366ff" />
```

## Building custom inputs

Every element with `s-model` gets an `_summitModel` property assigned to it, an
object with `get` and `set` functions that read and write the bound state:

```js
el._summitModel.get();      // current value
el._summitModel.set("new"); // update the state
```

A wrapper component can use this to drive the binding from a non-standard
control. Put `s-model` on the wrapper, then have the custom widget call
`_summitModel.set(...)` when its value changes and read `_summitModel.get()` to
render, and the two-way binding works exactly as it does for native inputs.

For the underlying value binding this builds on, see [s-bind](../s-bind/), and
for the form patterns it fits into, see [forms](../forms/).
