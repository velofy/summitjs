# s-transition

> Animate elements as they enter and leave.

`s-transition` animates an element as it becomes visible and as it hides. It
comes in two flavors: a class style, where you supply the CSS classes for each
phase, and a helper style, where a few modifiers produce a default fade and
scale with no CSS to write.

## How it pairs with s-show

Transitions run through [s-show](../s-show/). Put both directives on the same
element: `s-show` decides when the element is visible, and `s-transition`
animates the change. The very first render is applied instantly with no
animation. Every toggle after that plays the enter animation when the element
appears and the leave animation when it hides, and the element is only set to
`display: none` once the leave animation finishes.

Note that [s-if](../s-if/) does not run transitions. It adds and removes the node
directly, so to animate an element in and out, use `s-show` rather than `s-if`.

## Class style

Supply a class list for each phase after a colon. There are six phases, three for
entering and three for leaving:

- `s-transition:enter` stays applied for the whole enter animation.
- `s-transition:enter-start` is the starting look, applied before the first frame.
- `s-transition:enter-end` is the target look, applied on the next frame.
- `s-transition:leave`, `s-transition:leave-start`, and `s-transition:leave-end`
  mirror those three for leaving.

On enter, Summit adds the `enter` and `enter-start` classes, then on the next
frame removes `enter-start` and adds `enter-end`, so the element transitions from
the start look to the end look. When the animation is done it removes the `enter`
and `enter-end` classes. Leaving works the same way with the `leave` classes.

The animation's duration is read from the element's computed
`transition-duration`, so define your `transition` on the class that stays
applied through the phase, that is `enter` and `leave`. If no CSS transition
duration is found, Summit falls back to 150ms.

```html
<div s-data="{ open: false }">
  <button @click="open = !open">Toggle</button>

  <div
    s-show="open"
    s-transition:enter="fade"
    s-transition:enter-start="opacity-0 shift"
    s-transition:enter-end="opacity-100 rest"
    s-transition:leave="fade"
    s-transition:leave-start="opacity-100 rest"
    s-transition:leave-end="opacity-0 shift"
  >
    I fade and slide as I enter and leave.
  </div>
</div>
```

```css
/* Stays applied for the whole phase, so it sets the duration. */
.fade { transition: opacity 300ms ease, transform 300ms ease; }

/* The hidden look: start of enter, end of leave. */
.opacity-0 { opacity: 0; }
.shift     { transform: translateY(-8px); }

/* The visible look: end of enter, start of leave. */
.opacity-100 { opacity: 1; }
.rest        { transform: translateY(0); }
```

## Helper style

Use `s-transition` with no phase and let modifiers describe the animation with
inline styles instead of CSS classes:

- `.opacity` fades the element.
- `.scale` scales it. Follow it with a number to set the scale as a percent, for
  example `.scale.90` scales from 90%. On its own it uses 95%.
- `.duration` sets the time, for example `.duration.300ms` or `.duration.300`.
- `.delay` waits before starting, for example `.delay.100ms`.

A bare `s-transition` with no modifiers defaults to a fade combined with a scale
from 95%, over 150ms.

```summit
<div s-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <p s-show="open" s-transition>Default fade and scale.</p>
  <p s-show="open" s-transition.duration.500ms.scale.90>Slower, with more scale.</p>
</div>
```

Because the helper style writes its own inline styles, it needs no accompanying
CSS to be visible.
