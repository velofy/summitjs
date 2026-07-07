# s-if

> Conditionally render an element in the DOM.

`s-if` adds an element to the DOM when its expression is truthy and removes it
when it is falsy. Unlike hiding with `display`, the element genuinely comes and
goes.

## Conditionally rendering

Put `s-if` on the element you want to appear and disappear.

```summit
<div s-data="{ loggedIn: false }">
  <button @click="loggedIn = !loggedIn" s-text="loggedIn ? 'Log out' : 'Log in'">Log in</button>
  <p s-if="loggedIn">Welcome back. This paragraph is built fresh each time.</p>
  <p s-if="!loggedIn">Please log in to continue.</p>
</div>
```

Behind the scenes Summit leaves a comment marker where the element used to be.
When the condition turns true it clones the element in at that spot and
initializes it; when the condition turns false it tears the element down and
removes it. Because the node is rebuilt each time it returns, its internal state
does not carry over between removals.

## Works on any element

You do not need a `<template>` wrapper. `s-if` works directly on any element,
and the element itself (minus its `s-if` attribute) is the blueprint that gets
cloned in and out.

```html
<article s-if="post">...</article>
```

A `<template>` still works if you prefer it. In that case its single root child
is used as the blueprint:

```html
<template s-if="post">
  <article>...</article>
</template>
```

## Difference from s-show

`s-if` and [s-show](../s-show/) look similar but differ in what they do to the
element:

- `s-if` adds and removes the node. While the condition is false the element is
  not in the DOM at all and its reactive effects are destroyed. Returning to
  true rebuilds it from scratch.
- `s-show` always keeps the node in the DOM and only toggles its `display`. State
  inside it survives being hidden.

Use `s-if` when you want the element and its cost gone entirely, or when it is
rarely shown. Use `s-show` when you toggle frequently or need to preserve the
element's internal state.

For lists of elements that come and go, see [s-for](../s-for/), which reconciles
by key. To animate elements as they appear and disappear, pair
[s-transition](../s-transition/) with `s-show`.
