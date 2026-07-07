# s-cloak

> Hide markup until Summit has initialized it.

Before Summit runs, your markup is just plain HTML: an [s-text](../s-text/) span
is empty, an [s-show](../s-show/) element is fully visible, and bound attributes
are unset. For a brief moment the page can show that raw, un-hydrated state.
`s-cloak` hides an element until Summit has finished initializing it.

## The pattern

Add one CSS rule that hides anything carrying the attribute, then mark the
elements you want kept out of sight until they are ready.

```html
<style>
  [s-cloak] { display: none; }
</style>

<div s-data="{ user: 'Ada' }" s-cloak>
  Signed in as <span s-text="user"></span>
</div>
```

When Summit initializes the element it removes the `s-cloak` attribute. The rule
stops matching, and the element appears in its finished state with no flash of
raw template in between. Because the attribute is removed during setup, the rule
only ever affects markup that has not been processed yet.

The removal happens after the element's other directives have run, so by the
time it becomes visible its text, bindings, and classes are already in place.

## Where to put it

Put `s-cloak` on the outermost element whose contents you do not want to flash,
which is usually the same element that carries [s-data](../s-data/). You can
also place it on individual pieces, such as a list that fills in from a fetch.

The CSS rule is yours to add once, globally. Summit does not inject it for you,
and there is nothing else to configure: the attribute is simply removed the
first time the element initializes.
