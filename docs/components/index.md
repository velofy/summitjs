# UI Library

> An accessible, token-themed component library you copy into your markup and theme with CSS variables. Built with Summit, for people and AI agents.

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
`data-theme` attribute, exactly like this documentation.

## Accessibility

Interactive components ship with the roles and keyboard behavior you expect:
focus rings on every control, `Escape` to close overlays, click-outside to
dismiss menus, and labels wired to their inputs. Where a component needs an id
to pair a label with a control, use the [$id](https://velofy.co/summitjs/magic-id/) magic.

## The components

**Forms**
[Button](https://velofy.co/summitjs/comp-button/), [Input](https://velofy.co/summitjs/comp-input/), [Select](https://velofy.co/summitjs/comp-select/),
[Checkbox & Radio](https://velofy.co/summitjs/comp-checkbox/), [Switch](https://velofy.co/summitjs/comp-switch/)

**Data display**
[Card](https://velofy.co/summitjs/comp-card/), [Badge & Tag](https://velofy.co/summitjs/comp-badge/), [Alert](https://velofy.co/summitjs/comp-alert/),
[Avatar](https://velofy.co/summitjs/comp-avatar/), [Progress & Spinner](https://velofy.co/summitjs/comp-progress/)

**Overlays**
[Dialog](https://velofy.co/summitjs/comp-dialog/), [Dropdown Menu](https://velofy.co/summitjs/comp-menu/),
[Popover](https://velofy.co/summitjs/comp-popover/), [Tooltip](https://velofy.co/summitjs/comp-tooltip/), [Toast](https://velofy.co/summitjs/comp-toast/)

**Navigation**
[Tabs](https://velofy.co/summitjs/comp-tabs/), [Accordion](https://velofy.co/summitjs/comp-accordion/),
[Breadcrumb](https://velofy.co/summitjs/comp-breadcrumb/), [Pagination](https://velofy.co/summitjs/comp-pagination/)
