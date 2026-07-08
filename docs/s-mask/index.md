# s-mask

> Format an input as the user types against a pattern.

`s-mask` formats an input while you type it. Give it a pattern and Summit inserts
the fixed characters and rejects anything that does not fit, so phone numbers,
card numbers, and dates come out clean.

```summit
<div s-data>
  <label class="s-field">
    <span class="s-label">Phone</span>
    <input class="s-input" s-mask="'(999) 999-9999'" placeholder="(555) 123-4567">
  </label>
</div>
```

## Pattern tokens

The expression is a string of tokens:

- `9` accepts a digit
- `a` accepts a letter
- `*` accepts a letter or a digit

Every other character is a literal that the mask inserts for you as you reach it.

```html
<input s-mask="'9999-9999-9999-9999'">   <!-- card number -->
<input s-mask="'99/99'">                 <!-- expiry MM/YY -->
<input s-mask="'aaa-999'">               <!-- license plate -->
```

The pattern is an ordinary expression, so it can come from your state and change
at runtime:

```html
<input s-mask="pattern">
```
