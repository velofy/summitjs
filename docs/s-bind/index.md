# s-bind

> Bind attributes, classes, and styles, with the colon shorthand.

`s-bind` sets an attribute from an expression and keeps it in sync as the data
behind that expression changes. The shorthand is `:`, which is what you will
normally write.

```summit
<div s-data="{ label: 'Save changes' }">
  <button :title="label" s-text="label"></button>
</div>
```

`:title="label"` is exactly `s-bind:title="label"`. Whenever `label` changes,
the attribute updates.

## Boolean attributes

For HTML boolean attributes such as `disabled`, `checked`, `required`,
`readonly`, `selected`, `open`, `hidden`, and `multiple`, a truthy value adds the
attribute and a falsy value removes it entirely. Summit also reflects the value
to the matching DOM property, so form state stays correct.

```summit
<div s-data="{ agreed: false }">
  <label><input type="checkbox" s-model="agreed" /> I agree</label>
  <button :disabled="!agreed">Continue</button>
</div>
```

For a non-boolean attribute the rule is similar: `false`, `null`, and
`undefined` remove the attribute, and every other value is set as a string.

## :class

`:class` merges its result with whatever is already in the static `class`
attribute, so you never lose your base classes. The value can be a string, an
object, or an array.

The object form is the common one. Each key is a class name, applied while its
value is truthy.

```summit
<div s-data="{ active: true, busy: false }">
  <style>
    .tag { padding: .25rem .5rem; border: 1px solid var(--border); border-radius: 6px; }
    .tag.active { font-weight: 700; }
    .tag.busy { opacity: .5; }
  </style>
  <span class="tag" :class="{ active: active, busy: busy }">Status</span>
  <button @click="active = !active">Toggle active</button>
</div>
```

The array form lists classes to apply, and its entries can themselves be strings
or objects, which is handy for mixing always-on classes with conditional ones.

```html
<span class="tag" :class="[size, { active: isActive }]"></span>
```

Because the static classes are always kept, put a class in `class` or in
`:class`, not both, when you want to toggle it off.

## :style

`:style` takes an object of CSS properties and merges it onto the static `style`
attribute. Property names may be written camelCase or kebab-case, and any entry
whose value is `null` or `false` is skipped.

```summit
<div s-data="{ hue: 200 }">
  <input type="range" min="0" max="360" s-model="hue" />
  <p :style="{ color: 'hsl(' + hue + ', 70%, 45%)', fontWeight: 700 }">
    Live color at hue <span s-text="hue"></span>.
  </p>
</div>
```

A string value works too and is merged the same way.

## Binding an object of attributes

Given no attribute name, `s-bind="obj"` applies a whole object at once. Plain
entries become attributes, `@`-prefixed keys become event listeners, and
`:`-prefixed keys become dynamic bindings whose function is re-run reactively.

```html
<button s-bind="{ type: 'button', ':disabled'() { return busy }, '@click'() { save() } }">
  Save
</button>
```

## .camel

HTML attribute names are case-insensitive, which is a problem for SVG and other
camelCase attributes. The `.camel` modifier converts the bound name from dashes
to camelCase, so `:view-box.camel` sets `viewBox`.
