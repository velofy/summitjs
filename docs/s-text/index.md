# s-text

> Set an element's text content from an expression.

`s-text` sets an element's text content to the value of an expression and
updates it whenever the data behind that expression changes.

```summit
<div s-data="{ name: 'Ada' }">
  <p>Hello, <span s-text="name"></span>.</p>
</div>
```

The element's existing content is replaced, so you can give it fallback text to
show before Summit loads. It is swapped out on init.

## Any expression

The value is a full expression, not just a property name, so format it inline.

```summit
<div s-data="{ price: 42 }">
  <p s-text="'$' + price.toFixed(2)"></p>
  <button @click="price++">Raise price</button>
</div>
```

`null` and `undefined` render as an empty string. Every other value is turned
into a string.

## Text is escaped

`s-text` writes through `textContent`, so whatever the expression returns shows
as literal text. HTML in the value is never parsed, which makes `s-text` safe
for user-supplied strings.

```summit
<div s-data="{ raw: '<em>not italic</em>' }">
  <p s-text="raw"></p>
</div>
```

The angle brackets appear on screen instead of creating an `<em>`. When you
deliberately want markup rendered, and only for content you trust, reach for
[s-html](../s-html/).
