---
slug: technique-navbars
title: Navbar Patterns
nav: Navbar Patterns
category: techniques
order: 4
description: Navigation bars with active links, a responsive mobile menu, and a glass variant, wired with Summit state.
---

A navbar is mostly layout plus a little state: which link is active, and whether
the mobile menu is open. Summit handles the state; these classes handle the
look.

## Active link

Track the current section in `s-data` and mark the matching link.

```summit
<nav class="s-navbar" s-data="{ active: 'home' }">
  <span class="s-navbar-brand">Summit<span class="dot">.js</span></span>
  <div class="s-navbar-links">
    <a class="s-navbar-link" :class="{ 'is-active': active === 'home' }" @click="active = 'home'">Home</a>
    <a class="s-navbar-link" :class="{ 'is-active': active === 'docs' }" @click="active = 'docs'">Docs</a>
    <a class="s-navbar-link" :class="{ 'is-active': active === 'pricing' }" @click="active = 'pricing'">Pricing</a>
  </div>
  <div class="s-navbar-actions"><button class="s-btn s-btn-sm">Sign in</button></div>
</nav>
```

## Responsive with a mobile menu

Below a narrow width the inline links hide and a toggle appears. The toggle
flips an `open` flag that reveals a stacked menu. Resize the window to see it
switch.

```summit
<nav s-data="{ open: false }">
  <div class="s-navbar">
    <span class="s-navbar-brand">Summit<span class="dot">.js</span></span>
    <div class="s-navbar-links">
      <a class="s-navbar-link">Home</a>
      <a class="s-navbar-link">Docs</a>
      <a class="s-navbar-link">Pricing</a>
    </div>
    <div class="s-navbar-actions">
      <button class="s-navbar-toggle" @click="open = !open" aria-label="Toggle menu" :aria-expanded="open">&#9776;</button>
    </div>
  </div>
  <div class="s-navbar-mobile" :class="{ 'is-open': open }">
    <a class="s-navbar-link" @click="open = false">Home</a>
    <a class="s-navbar-link" @click="open = false">Docs</a>
    <a class="s-navbar-link" @click="open = false">Pricing</a>
  </div>
</nav>
```

## Glass navbar

Drop [matte glass](../technique-glassmorphism/) onto the bar for a header that
floats over the page.

```summit
<div class="s-glass-stage" style="padding:1.5rem">
  <span class="blob b1"></span><span class="blob b2"></span>
  <nav class="s-navbar s-glass-matte">
    <span class="s-navbar-brand">Summit<span class="dot">.js</span></span>
    <div class="s-navbar-links">
      <a class="s-navbar-link is-active">Home</a>
      <a class="s-navbar-link">Docs</a>
    </div>
    <div class="s-navbar-actions"><button class="s-btn s-btn-sm">Get started</button></div>
  </nav>
</div>
```

## Notes

- Make it sticky with `position: sticky; top: 0` on the `.s-navbar`.
- The classes are `.s-navbar`, `.s-navbar-brand`, `.s-navbar-links`,
  `.s-navbar-link` (`.is-active`), `.s-navbar-actions`, `.s-navbar-toggle`, and
  `.s-navbar-mobile` (`.is-open`).
