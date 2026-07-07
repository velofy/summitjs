# $root

> The root element of the nearest component.

`$root` is the root element of the nearest component, the closest ancestor (or
the element itself) that carries an `s-data`. Wherever you are in the markup,
`$root` points back at the element that owns the component.

```summit
<div s-data="{ count: 0 }" data-role="panel">
  <div>
    <button @click="count = $root.querySelectorAll('button').length">
      Count buttons under $root
    </button>
  </div>
  <p>$root is a <span s-text="$root.tagName"></span> element.</p>
  <p>buttons found: <span s-text="count"></span></p>
</div>
```

Even though the button is nested two levels deep, `$root` reaches past its
wrappers to the outer `s-data` element.

## $root versus $el

[$el](../magic-el/) is the element the current expression runs on, which changes
from one directive to the next. `$root` is fixed for the whole component: it is
the same element for every expression inside it. Use `$el` for the element at
hand and `$root` when you need the component's outer boundary, for example to
scope a query or read a data attribute set on the root.

If the expression is outside any component, `$root` is `null`.
