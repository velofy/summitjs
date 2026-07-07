# Events

> Respond to user input with s-on and its @ shorthand, including a full set of modifiers for keys, timing, and event control.

`s-on` listens for an event and runs an expression when it fires. The shorthand
is `@`, which is what you will normally reach for.

```summit
<div s-data="{ open: false }">
  <button @click="open = !open">Toggle</button>
  <p s-show="open">Now you see it.</p>
</div>
```

## The event object

The current event is available as `$event` inside the expression.

```html
<input @input="query = $event.target.value" />
```

If the expression evaluates to a function, Summit calls it with the event, so a
bare method reference works too:

```html
<button @click="handleClick">Save</button>
```

## Modifiers

Modifiers are dot-suffixed flags that adjust how the listener behaves. They
stack in any order.

### Event control

| Modifier | Effect |
| --- | --- |
| `.prevent` | `event.preventDefault()` |
| `.stop` | `event.stopPropagation()` |
| `.self` | Only fire when the target is this element, not a child |
| `.outside` | Fire when a click lands outside this element |
| `.once` | Remove the listener after it fires once |
| `.capture` | Listen in the capture phase |
| `.passive` | Register a passive listener |

```summit
<div s-data="{ open: true }">
  <button @click="open = true">Open</button>
  <div s-show="open" @click.outside="open = false" style="padding:1rem;border:1px solid var(--border);border-radius:8px;margin-top:.5rem">
    Click anywhere outside to close.
  </div>
</div>
```

### Targets

By default the listener is attached to the element. Redirect it with `.window`
or `.document`, which is how you register global shortcuts.

```html
<div @keydown.escape.window="close()"></div>
```

### Keys

Filter keyboard events to specific keys. Named aliases include `.enter`,
`.escape`, `.tab`, `.space`, `.up` `.down` `.left` `.right` (also `.arrow-up`
and friends), `.page-up`, `.page-down`, `.home`, `.end`, `.delete`, and
`.backspace`. Any other key works by its name, for example `.k`.

```summit
<div s-data="{ log: '' }">
  <input @keydown.enter="log = 'Submitted: ' + $event.target.value" placeholder="Type and press Enter" />
  <p s-text="log"></p>
</div>
```

Combine with system keys `.shift`, `.ctrl`, `.alt`, and `.cmd` (alias `.meta`)
for shortcuts. This fires only on Cmd/Ctrl + K:

```html
<div @keydown.cmd.k.prevent="openPalette()"></div>
```

### Timing

`.debounce` waits until events stop before running; `.throttle` runs at most
once per interval. Both default to 250ms and accept a custom duration.

```html
<input @input.debounce.400ms="search()" />
```

### Name transforms

`.camel` turns a dashed event name into camelCase, and `.dot` restores dots in
event names that used dashes:

```html
<div @custom-event.camel="onCustomEvent()"></div>
```

For dispatching your own events, see [$dispatch](../magic-dispatch/). The full
directive reference is on the [s-on](../s-on/) page.
