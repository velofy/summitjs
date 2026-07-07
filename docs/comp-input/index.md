# Input

> Text inputs and textareas with labels, help text, addons, and validation state.

Inputs collect a line or a block of text. Apply `.s-input` to any text-like
`<input>` and `.s-textarea` to a `<textarea>`, then bind the value with
[`s-model`](../forms/) to keep state and control in sync.

```summit
<div s-data="{ value: '' }" class="s-stack">
  <input class="s-input" s-model="value" placeholder="Type something" />
  <p class="s-help">You typed: <span s-text="value || 'nothing yet'"></span></p>
</div>
```

## A full field

Wrap a label, control, and help text in `.s-field` for consistent spacing. Use
`.s-label` for the label and `.s-help` for the hint below. Mark required fields
with a `.s-req` asterisk inside the label.

```summit
<div class="s-field">
  <label class="s-label" for="email-1">Email <span class="s-req">*</span></label>
  <input class="s-input" id="email-1" type="email" placeholder="you@example.com" />
  <p class="s-help">We only use this to send receipts.</p>
</div>
```

## Input groups

`.s-input-group` sits an `.s-addon` flush against an input to show a prefix such
as a protocol, currency symbol, or unit. The group squares off the touching
corners for you.

```summit
<div class="s-input-group">
  <span class="s-addon">https://</span>
  <input class="s-input" placeholder="your-site.com" />
</div>
```

## Validation state

Add `is-invalid` to an input to switch its border to the danger color, and show
an `.s-error` message in place of the help text. Bind both to state so the error
appears only when the value is actually wrong.

```summit
<div s-data="{ email: '' }" class="s-field">
  <label class="s-label" for="email-2">Email</label>
  <input class="s-input" id="email-2" type="email" s-model="email"
    :class="{ 'is-invalid': email.length > 0 && !email.includes('@') }"
    placeholder="you@example.com" />
  <p class="s-error" s-show="email.length > 0 && !email.includes('@')">Enter a valid email address.</p>
</div>
```

## Textarea

`.s-textarea` styles a multi-line field. It grows vertically and can be resized
by the user. Bind it with `s-model` the same way as a single-line input.

```summit
<div s-data="{ note: '' }" class="s-field">
  <label class="s-label" for="note-1">Notes</label>
  <textarea class="s-textarea" id="note-1" s-model="note" placeholder="Add any details"></textarea>
  <p class="s-help"><span s-text="note.length"></span> characters</p>
</div>
```

## Copy and paste

```html
<div class="s-field">
  <label class="s-label" for="email">Email <span class="s-req">*</span></label>
  <input class="s-input" id="email" type="email" placeholder="you@example.com" />
  <p class="s-help">We only use this to send receipts.</p>
</div>

<div class="s-input-group">
  <span class="s-addon">https://</span>
  <input class="s-input" placeholder="your-site.com" />
</div>

<div class="s-field">
  <label class="s-label" for="handle">Username</label>
  <input class="s-input is-invalid" id="handle" aria-invalid="true" aria-describedby="handle-error" value="taken" />
  <p class="s-error" id="handle-error">That username is already in use.</p>
</div>

<div class="s-field">
  <label class="s-label" for="bio">Bio</label>
  <textarea class="s-textarea" id="bio" placeholder="Tell us about yourself"></textarea>
</div>

<input class="s-input" value="Read only" disabled />
```

## Accessibility

Pair every control with a `<label>` by matching the label's `for` to the input's
`id`, so clicking the label focuses the field. When ids are generated at runtime,
reach for the [$id](../magic-id/) magic. The `.s-req` asterisk is decorative, so
keep the field's real requirement in the `required` attribute. For an invalid
control, set `aria-invalid="true"` and point `aria-describedby` at the
`.s-error` element so screen readers announce the message. See
[Select](../comp-select/) for choosing from options and [s-model](../s-model/)
for the binding details.
