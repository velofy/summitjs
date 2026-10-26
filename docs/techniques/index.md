# Techniques

> Presentational recipes you compose with Summit's directives and classes: animated loaders, matte glassmorphism, retro interfaces, navbar patterns, and using Tailwind.

Techniques are recipes that sit on top of the core: small, self-contained
patterns you copy in and compose with the directives and components you already
use. They are pure markup plus a class, token-themed, and they work in both
light and dark.

Load the stylesheet once, then use any `s-` prefixed class from the pages listed here.
The examples on these pages also use layout and UI Library classes such as
`.s-row`, `.s-stack`, `.s-btn`, `.s-avatar`, and `.s-spinner`. Those live in
`components.css`; see the [UI Library](https://github.com/velofy/summitjs/blob/main/content/components.md) for how to load it.

```html
<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/velofy/summitjs@main/docs/assets/techniques.css" />
```

## Loaders

- [Loaders & Spinners](https://github.com/velofy/summitjs/blob/main/content/technique-animation.md): fifteen pure-CSS loaders, animated logo marks, and skeleton screens.

## Style families

- [Matte Glassmorphism](https://github.com/velofy/summitjs/blob/main/content/technique-glassmorphism.md): frosted, low-gloss surfaces that stay legible over anything.
- [Neumorphism](https://github.com/velofy/summitjs/blob/main/content/technique-neumorphism.md): soft, extruded UI built from twin light and dark shadows.
- [Claymorphism](https://github.com/velofy/summitjs/blob/main/content/technique-claymorphism.md): puffy, rounded, playful clay surfaces.
- [Retro UI](https://github.com/velofy/summitjs/blob/main/content/technique-retro.md): hard shadows and neon text.
- [Brutalism](https://github.com/velofy/summitjs/blob/main/content/technique-brutalism.md): stark borders, loud type, and blunt offset shadows.
- [Aurora Backgrounds](https://github.com/velofy/summitjs/blob/main/content/technique-aurora.md): slow, glowing color fields behind your content.
- [Glow & Spotlight](https://github.com/velofy/summitjs/blob/main/content/technique-glow.md): a highlight that follows the cursor across a card.

## Patterns

- [Navbar Patterns](https://github.com/velofy/summitjs/blob/main/content/technique-navbars.md): active links, a responsive mobile menu, and a glass bar.
- [Using Tailwind CSS](https://github.com/velofy/summitjs/blob/main/content/technique-tailwind.md): Summit for behavior, Tailwind for styling, no build step.
