---
slug: components
title: UI Library
nav: Overview
category: components
order: 0
description: An accessible, token-themed component library you copy into your markup and theme with CSS variables. Built with Summit, for people and AI agents.
---

Summit ships a copy-in UI library: a set of accessible, token-themed components
you drop straight into your HTML. There is no component runtime to install. Each
one is plain markup plus a class, and the interactive ones are wired with the
same `s-` directives you already know. Theme the whole set by changing a few CSS
variables.

It is built the way an AI agent likes to work: predictable class names, behavior
that lives on the element, and nothing that needs a build step.

```summit
<div class="s-row">
  <button class="s-btn">Solid</button>
  <button class="s-btn s-btn-outline">Outline</button>
  <button class="s-btn s-btn-ghost">Ghost</button>
  <span class="s-badge s-badge-success">Live</span>
</div>
```

## Using a component

Load the stylesheet once, then copy any component's markup.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/assets/components.css" />
```

Or copy the rules you need out of `components.css` into your own styles. Every
class is prefixed `s-`, so nothing collides with your existing CSS.

## Theming

Components read the same design tokens as the rest of Summit. Override them on
`:root` (or any scope) and the whole set restyles. The most useful ones:

```css
:root {
  --accent: #ea580c;      /* primary / brand color */
  --s-radius: 12px;       /* corner rounding */
  --s-danger: #e11d48;    /* destructive actions */
}
```

Light and dark are handled for you through `prefers-color-scheme` and the
`data-theme` attribute: `components.css` switches its feedback palette under
`prefers-color-scheme: dark` and `:root[data-theme="dark"]`.

### Base tokens you define

`components.css` defines its own `--s-` tokens (feedback colors, radius, focus
ring), but it also reads base tokens that it does not define: `--accent`,
`--accent-2`, `--accent-soft`, `--bg`, `--surface`, `--surface-2`, `--border`,
`--text`, `--muted`, `--faint`, `--ink`, `--ink-contrast`, `--shadow`,
`--shadow-lg`, `--font`, `--body` and `--mono`. The old documentation site set
them in its own `docs.css`. When you use `components.css` on its own, define
them on `:root`. These are the light values the old site used:

```css
:root {
  --bg: #ffffff; --surface: #ffffff; --surface-2: #f7f9fc; --border: #e6e9ef;
  --text: #0f172a; --muted: #475569; --faint: #64748b;
  --accent: #a35200; --accent-2: #7c3d00; --accent-soft: #fff4d6;
  --ink: #0f172a; --ink-contrast: #ffffff;
  --shadow: 0 1px 2px rgba(15,23,42,.05), 0 10px 30px rgba(15,23,42,.06);
  --shadow-lg: 0 24px 60px rgba(15,23,42,.14);
  --font: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
  --body: system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  --mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
}
```

The old site listed the Geist fonts first in `--font`, `--body` and `--mono`;
use any font stack you like.

## Accessibility

Interactive components ship with the roles and keyboard behavior you expect:
focus rings on every control, `Escape` to close overlays, click-outside to
dismiss menus, and labels wired to their inputs. Where a component needs an id
to pair a label with a control, use the [$id](../magic-id/) magic.

## The components

**Forms**
[Button](../comp-button/), [Input](../comp-input/), [Select](../comp-select/),
[Checkbox & Radio](../comp-checkbox/), [Switch](../comp-switch/)

**Data display**
[Card](../comp-card/), [Badge & Tag](../comp-badge/), [Table](../comp-table/),
[Alert](../comp-alert/), [Avatar](../comp-avatar/), [Progress & Spinner](../comp-progress/)

**Overlays**
[Dialog](../comp-dialog/), [Dropdown Menu](../comp-menu/),
[Popover](../comp-popover/), [Tooltip](../comp-tooltip/), [Toast](../comp-toast/)

**Navigation**
[Tabs](../comp-tabs/), [Accordion](../comp-accordion/),
[Breadcrumb](../comp-breadcrumb/), [Pagination](../comp-pagination/)
