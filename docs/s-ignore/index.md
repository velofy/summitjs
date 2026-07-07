# s-ignore

> Skip Summit initialization for an element and its children.

`s-ignore` tells Summit to leave an element and everything inside it alone.
Summit does not read its directives, does not descend into its children, and
sets up no reactivity anywhere in that subtree.

## Skipping a subtree

When Summit reaches an element marked `s-ignore`, it stops there and moves on.
Any directives inside the ignored region are left untouched.

```summit
<div s-data="{ name: 'Ada' }">
  <p>Summit runs here: <span s-text="name"></span></p>
  <div s-ignore>
    <p>Summit skips here: <span s-text="name"></span></p>
  </div>
</div>
```

The first span shows `Ada`. The second sits inside an `s-ignore` block, so its
[s-text](../s-text/) never runs and the span stays empty. The skip covers the
whole subtree, not just the element itself.

## When to use it

- **Third-party widgets** that manage their own DOM, such as a map, a rich text
  editor, or a payment field. Wrapping the mount point in `s-ignore` keeps
  Summit from walking into markup it does not own and does not understand.
- **Server-rendered islands** and large static regions where you simply want to
  skip the initialization walk.

`s-ignore` is a hard stop for the entire subtree, not a per-directive opt-out.
If you need reactivity on part of that region, keep it outside the ignored
element. Where [s-cloak](../s-cloak/) hides markup until it is ready, `s-ignore`
never initializes it at all.
