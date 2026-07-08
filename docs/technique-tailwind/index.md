# Using Tailwind CSS

> Summit for behavior, Tailwind for styling. They compose cleanly because Summit lives in attributes and Tailwind lives in classes.

Summit and Tailwind solve different problems and never collide. Tailwind styles
your markup through the `class` attribute; Summit adds behavior through `s-`
attributes. You can add, toggle, and compute Tailwind classes with Summit's
reactivity, and neither needs a build step.

## Toggle utilities reactively

Bind Tailwind classes with `:class`. Summit merges the reactive object with any
static `class` you already have.

```html
<div s-data="{ open: false }">
  <button class="rounded-md bg-teal-600 px-4 py-2 font-semibold text-white"
          @click="open = !open">
    Toggle
  </button>

  <p class="mt-3 text-slate-600" :class="open ? 'block' : 'hidden'">
    Now you see me.
  </p>
</div>
```

## Compute classes from state

Because `:class` takes an object, you can drive whole variants from a value.

```html
<div s-data="{ status: 'ok' }">
  <span class="rounded px-2 py-1 text-sm font-medium"
        :class="{
          'bg-green-100 text-green-700': status === 'ok',
          'bg-red-100 text-red-700': status === 'error'
        }">
    <span s-text="status"></span>
  </span>
  <button class="ml-2 underline" @click="status = status === 'ok' ? 'error' : 'ok'">flip</button>
</div>
```

## No build, both from a CDN

For a quick page, load Tailwind's browser build and Summit together. Nothing to
compile.

```html
<script src="https://cdn.tailwindcss.com"></script>
<script src="https://velofy.github.io/summit/summit.min.js" defer></script>

<div s-data="{ count: 0 }" class="flex items-center gap-3 p-4">
  <button class="rounded bg-slate-900 px-3 py-1.5 text-white" @click="count++">Add</button>
  <span class="text-lg font-bold" s-text="count"></span>
</div>
```

For production, use Tailwind's CLI or a framework integration to purge unused
classes, then load `summitjs` alongside your bundle exactly as above.

## Why it composes

- Summit reads only `s-`, `@`, and `:` attributes, so it never touches your
  `class` list except where you ask it to with `:class`.
- Tailwind's classes are static strings, which is exactly what Summit's
  [s-bind](../s-bind/) is best at toggling.
- The [UI Library](../components/) and [Techniques](../techniques/) are optional:
  use them, use Tailwind, or mix both in the same page.
