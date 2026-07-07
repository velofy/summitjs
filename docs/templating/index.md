# Templating

> Put state on the screen with s-text and s-html, and drive attributes, classes, and styles with s-bind.

Templating is how state reaches the page: text, HTML, attributes, classes, and
styles. Summit gives you three directives for it, each reactive.

## Text

`s-text` sets an element's text content. It escapes automatically, so it is
always safe for untrusted values.

```summit
<div s-data="{ user: 'Ada' }">
  <p>Signed in as <span s-text="user"></span>.</p>
</div>
```

Any expression works, not just a variable:

```html
<span s-text="'You have ' + items.length + ' items'"></span>
```

## HTML

`s-html` sets `innerHTML`. Only ever use it with content you trust, because it
is not escaped.

```html
<div s-html="renderedMarkdown"></div>
```

## Attributes

`s-bind` sets an attribute from an expression. The shorthand is a leading colon,
which is what you will normally write.

```summit
<div s-data="{ url: 'https://example.com', busy: true }">
  <a :href="url">Visit</a>
  <button :disabled="busy">Save</button>
</div>
```

Boolean attributes are handled for you: when the expression is falsy the
attribute is removed, when truthy it is added.

## Classes

Bind `class` with an object and each key is toggled by its value. Classes already
on the element in plain `class` are kept.

```summit
<div s-data="{ active: true, error: false }">
  <span class="badge" :class="{ 'is-active': active, 'is-error': error }">status</span>
  <button @click="active = !active">Toggle</button>
</div>
```

An array of names works too:

```html
<span :class="[size, active && 'on']"></span>
```

## Styles

Bind `style` with an object of camelCase or kebab-case properties.

```summit
<div s-data="{ pct: 40 }">
  <div style="height:8px;background:#e6e9ef;border-radius:4px">
    <div :style="{ width: pct + '%', height: '8px', background: '#0d9488', borderRadius: '4px' }"></div>
  </div>
  <button @click="pct = Math.min(100, pct + 10)">More</button>
</div>
```

For the full attribute reference, including how bound values merge with static
ones, see [s-bind](../s-bind/).
