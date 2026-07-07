# s-on

> Listen for events with the @ shorthand and a full set of modifiers.

`s-on` attaches an event listener to an element and runs an expression each time
the event fires. You write it as `s-on:click="..."`, but the `@` shorthand is
what you will reach for almost every time:

```summit
<div s-data="{ count: 0 }">
  <button @click="count++">Clicked <span s-text="count"></span> times</button>
</div>
```

`@click` and `s-on:click` are exactly the same directive. The part after the
colon (or the `@`) is the event name, and everything after the first dot is a
[modifier](#modifiers).

## The event object

The native event is available inside the expression as `$event`, so you can read
the target, the pressed key, coordinates, or anything else off it.

```html
<input @input="query = $event.target.value" />
```

If your expression evaluates to a function rather than running inline, Summit
calls that function for you and passes the event as its argument. That means a
bare method reference works without writing out the call:

```html
<button @click="handleClick">Save</button>
```

Here `handleClick` receives the event, the same as if you had written
`@click="handleClick($event)"`.

## Modifiers

Modifiers are dot-suffixed flags on the directive name that change how the
listener behaves. They stack, and apart from a timing duration (which has to
follow its `.debounce` or `.throttle`) the order does not matter.

### Event control

These adjust dispatch and registration of the listener itself.

| Modifier | Effect |
| --- | --- |
| `.prevent` | Calls `event.preventDefault()` before your expression runs |
| `.stop` | Calls `event.stopPropagation()` before your expression runs |
| `.self` | Only fires when `event.target` is this element, never a descendant |
| `.outside` | Fires when the event happens outside this element (see [Targets](#targets)) |
| `.once` | Registers the listener with `{ once: true }`, so it runs at most once |
| `.capture` | Registers the listener in the capture phase (`{ capture: true }`) |
| `.passive` | Registers a passive listener (`{ passive: true }`) |

```summit
<div s-data="{ hits: 0 }">
  <button @click.once="hits++">Only counts once</button>
  <span s-text="hits"></span>
</div>
```

### Targets

By default the listener lives on the element itself. Two modifiers move it
elsewhere, which is how you register global shortcuts and dismiss-on-outside
behavior:

- `.window` attaches the listener to `window`.
- `.document` attaches it to `document`.
- `.outside` also listens on `document`, then ignores any event whose target is
  this element or one of its descendants. Events on nodes that have already been
  removed from the page are ignored too, so tearing down an element does not
  trigger it.

```summit
<div s-data="{ open: true }">
  <button @click="open = true">Open</button>
  <div s-show="open" @click.outside="open = false" style="padding:1rem;border:1px solid var(--border);border-radius:8px;margin-top:.5rem">
    Click anywhere outside this box to close it.
  </div>
</div>
```

A window-scoped keyboard shortcut looks like this:

```html
<div @keydown.escape.window="closeModal()"></div>
```

### Key filters

On a keyboard event you can restrict the listener to specific keys by adding the
key name as a modifier. Summit recognizes these aliases and maps each to the
matching `KeyboardEvent.key` value:

| Modifier | Matches `event.key` |
| --- | --- |
| `.enter` | `Enter` |
| `.tab` | `Tab` |
| `.space` | `" "` (the space bar) |
| `.esc` / `.escape` | `Escape` |
| `.up` / `.arrow-up` | `ArrowUp` |
| `.down` / `.arrow-down` | `ArrowDown` |
| `.left` / `.arrow-left` | `ArrowLeft` |
| `.right` / `.arrow-right` | `ArrowRight` |
| `.page-up` | `PageUp` |
| `.page-down` | `PageDown` |
| `.home` | `Home` |
| `.end` | `End` |
| `.delete` | `Delete` |
| `.backspace` | `Backspace` |

Any key that is not in the table matches by its own name, compared
case-insensitively (and with camelCase keys treated as their dashed form). So
`.k` matches the K key and `.a` matches A.

```summit
<div s-data="{ log: 'Nothing yet' }">
  <input @keydown.enter="log = 'Submitted: ' + $event.target.value" placeholder="Type and press Enter" />
  <p s-text="log"></p>
</div>
```

When you list more than one key filter, the listener fires if the event matches
any of them.

### System keys

System modifiers require a held modifier key. Unlike key filters, these are
combined with AND, so every one you list must be down when the event fires.

| Modifier | Requires |
| --- | --- |
| `.shift` | Shift held |
| `.ctrl` | Control held |
| `.alt` | Alt / Option held |
| `.cmd` / `.meta` | Command / Windows (Meta) held |

Combine them with a key filter to build shortcuts. This one fires only on
Cmd (or the Meta key) plus K, and blocks the browser default:

```html
<div @keydown.cmd.k.prevent.window="openPalette()"></div>
```

### Timing

`.debounce` waits until events stop arriving before running your expression, and
`.throttle` runs it at most once per interval. Both default to 250ms. To set a
custom duration, add it as the very next modifier after the timing flag. A bare
number and a `ms` suffix are milliseconds; an `s` suffix is seconds.

```html
<input @input.debounce="search()" />        <!-- 250ms -->
<input @input.debounce.400ms="search()" />   <!-- 400ms -->
<div @scroll.throttle.2s="track()"></div>    <!-- 2000ms -->
```

### Name transforms

Because HTML lowercases attribute names, two modifiers help you target events
whose names contain capitals or dots:

- `.camel` converts a dashed event name to camelCase, so `@custom-event.camel`
  listens for a `customEvent` event.
- `.dot` converts dashes back to dots, so `@my-event.dot` listens for a
  `my.event` event.

```html
<div @custom-event.camel="onCustomEvent($event.detail)"></div>
```

To send events that these modifiers can catch, use
[$dispatch](../magic-dispatch/). For the state that these listeners usually
update, see [s-data](../s-data/) and [reactivity](../reactivity-state/).
