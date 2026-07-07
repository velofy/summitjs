---
slug: comp-alert
title: Alert
nav: Alert
category: components
order: 8
description: Contextual feedback banners for info, success, warning, and danger.
---

An alert is an inline banner that gives the reader feedback in place: a helpful
note, a success confirmation, a warning, or an error. It sits in the flow of the
page rather than floating over it, which makes it the right choice for messages
tied to a specific spot, like a form section or a settings panel. Each variant
pairs an icon with a title and a short description.

```summit
<div class="s-stack">
  <div class="s-alert s-alert-info">
    <svg class="s-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
    <div>
      <p class="s-alert-title">Heads up</p>
      <p class="s-alert-desc">Your trial ends in five days. Add a card to keep your projects.</p>
    </div>
  </div>
  <div class="s-alert s-alert-success">
    <svg class="s-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="m9 11 3 3L22 4"/></svg>
    <div>
      <p class="s-alert-title">Saved</p>
      <p class="s-alert-desc">Your changes are live and visible to your team.</p>
    </div>
  </div>
  <div class="s-alert s-alert-warning">
    <svg class="s-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
    <div>
      <p class="s-alert-title">Almost out of space</p>
      <p class="s-alert-desc">You have used 92% of your storage. Free some up before uploading more.</p>
    </div>
  </div>
  <div class="s-alert s-alert-danger">
    <svg class="s-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
    <div>
      <p class="s-alert-title">Payment failed</p>
      <p class="s-alert-desc">We could not charge your card. Update it to avoid losing access.</p>
    </div>
  </div>
</div>
```

## Anatomy

An alert is a flex row of `.s-alert` plus a variant class:

- `.s-alert-info`, `.s-alert-success`, `.s-alert-warning`, or `.s-alert-danger`
  set the background tint, border, and icon color from the semantic palette.
- `.s-alert-icon` on an inline `<svg>` sizes and colors the leading icon. Use
  `stroke="currentColor"` so it inherits the variant color.
- `.s-alert-title` is the bold headline and `.s-alert-desc` is the muted body.
  Wrap them together in a `<div>` so they stack beside the icon.

Leave off the variant class for a neutral, surface-colored alert. You can also
drop the title and keep a single `.s-alert-desc` for a one-line note.

## Copy

```html
<div class="s-alert s-alert-warning">
  <svg class="s-alert-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"
       stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/>
    <path d="M12 9v4"/>
    <path d="M12 17h.01"/>
  </svg>
  <div>
    <p class="s-alert-title">Almost out of space</p>
    <p class="s-alert-desc">You have used 92% of your storage.</p>
  </div>
</div>
```

## Notes

- Pick the variant by meaning, not color. Danger is for errors and destructive
  outcomes, warning for things that need attention soon.
- The icon is decorative here because the title carries the message. If an alert
  has no text title, add an `aria-label` to convey its intent.
- Alerts stay in the layout. For transient, stacked messages that appear and
  auto-dismiss, use a toast; for status labels, use a [badge](../comp-badge/).

See the whole component set on the [overview](../components/).
