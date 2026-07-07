# s-teleport

> Render an element at a different place in the DOM.

`s-teleport` renders content somewhere else in the document while keeping it
wired to the component it was written in. It is what you use for modals,
popovers, and toasts that need to escape a parent's `overflow` or stacking
context.

## A template that renders elsewhere

`s-teleport` goes on a `<template>` element. Its value is a CSS selector,
resolved with `document.querySelector`. Summit clones the template's content,
inserts the clones at the target, and initializes them with the current
component's scope, so the moved markup can still read and write the component's
state.

```html
<div s-data="{ open: false }">
  <button @click="open = true">Open</button>

  <template s-teleport="body">
    <div s-show="open" class="modal">
      <p>I render at the end of body, but I still read the component.</p>
      <button @click="open = false">Close</button>
    </div>
  </template>
</div>
```

The modal markup is authored inside the component, yet it ends up appended to
`<body>`, clear of any `overflow: hidden` ancestor. Because Summit initializes
it with the component's scope, `open` still controls it with
[s-show](../s-show/) and the Close button still writes back.

## Choosing where it lands

By default the content is placed inside the target, as its last child. Two
modifiers place it relative to the target instead.

| Placement | Result |
| --- | --- |
| `s-teleport="sel"` | Appended inside the target, as its last child |
| `s-teleport.prepend="sel"` | Inserted just before the target element |
| `s-teleport.append="sel"` | Inserted just after the target element |

So `s-teleport="body"` puts the content at the end of the page body, while
`s-teleport.append="#anchor"` drops it in right after the element with id
`anchor`.

## Notes

- The directive only works on a `<template>` element. On anything else Summit
  logs a warning and does nothing.
- The selector must match an element that already exists when the template
  initializes. If the target is not found, Summit warns and renders nothing.
- Only the template's children are moved. The `<template>` element itself stays
  where you wrote it and shows nothing.
- When the component or the template is removed, Summit tears down and removes
  the teleported nodes too, so no detached DOM is left behind.

To animate the teleported content as it appears, pair it with
[s-transition](../s-transition/).
