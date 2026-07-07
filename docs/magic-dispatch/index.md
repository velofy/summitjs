# $dispatch

> Dispatch a custom DOM event.

`$dispatch` creates and dispatches a `CustomEvent` from the current element, so
components can talk to each other through the DOM. The signature is
`$dispatch(name, detail?, options?)`.

```summit
<div s-data="{ received: 'nothing yet' }" @notify="received = $event.detail">
  <button @click="$dispatch('notify', 'hello from the button')">Send</button>
  <p>parent received: <span s-text="received"></span></p>
</div>
```

The button dispatches `notify`, the event bubbles up to the surrounding
component, and its `@notify` handler reads the payload from `$event.detail`.

## The payload

Whatever you pass as the second argument becomes `event.detail`. Read it in a
listener as `$event.detail`.

```html
<button @click="$dispatch('add-to-cart', { id: 42, qty: 2 })">Add</button>
```

## Defaults and options

The event is created with `bubbles`, `composed`, and `cancelable` all set to
`true`, so it rises through ancestors, crosses shadow DOM boundaries, and can be
cancelled. Pass a third argument to override any of those.

```js
$dispatch("saved", payload, { bubbles: false });
```

`$dispatch` returns `false` when a listener calls `preventDefault()` on the
event, and `true` otherwise.

## Listening from elsewhere

Because the event bubbles, any ancestor can listen with `@event-name`. To catch
an event no matter where it was dispatched, listen on the window with the
`.window` modifier.

```html
<div @add-to-cart.window="count += $event.detail.qty"></div>
```

For the full listener reference, including modifiers, see the [s-on](../s-on/)
and [Events](../events/) pages.
