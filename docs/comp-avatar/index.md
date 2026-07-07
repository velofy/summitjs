# Avatar

> User avatars with initials or images, sizes, and stacked groups.

An avatar is a small, round token that stands in for a person or account. Give it
initials and it renders a tinted circle with centered text; give it an `<img>`
and the photo fills the circle, cropped to a cover fit. Three sizes and a stacked
group cover most of what a user list, comment thread, or header bar needs.

```summit
<div class="s-row">
  <span class="s-avatar">AN</span>
  <span class="s-avatar">GK</span>
  <span class="s-avatar">RB</span>
  <span class="s-avatar">JS</span>
</div>
```

## Sizes

The base avatar is 40px. Add `.s-avatar-sm` for a compact 30px token or
`.s-avatar-lg` for a 56px one. The font scales with each size, so initials stay
centered and legible.

```summit
<div class="s-row">
  <span class="s-avatar s-avatar-sm">SM</span>
  <span class="s-avatar">MD</span>
  <span class="s-avatar s-avatar-lg">LG</span>
</div>
```

## Images

Put an `<img>` inside `.s-avatar` and it covers the circle. The wrapper clips the
photo to a round shape, so any square or rectangular source works.

```summit
<div class="s-row">
  <span class="s-avatar s-avatar-lg">
    <img alt="Avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='56' height='56'%3E%3Crect width='56' height='56' fill='%237c3aed'/%3E%3Ccircle cx='28' cy='22' r='10' fill='%23fff'/%3E%3Cellipse cx='28' cy='52' rx='18' ry='16' fill='%23fff'/%3E%3C/svg%3E" />
  </span>
  <span class="s-avatar">
    <img alt="Avatar" src="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='40' height='40'%3E%3Crect width='40' height='40' fill='%230284c7'/%3E%3Ccircle cx='20' cy='16' r='7' fill='%23fff'/%3E%3Cellipse cx='20' cy='38' rx='13' ry='12' fill='%23fff'/%3E%3C/svg%3E" />
  </span>
</div>
```

## Stacked group

Wrap several avatars in `.s-avatar-group` and they overlap with a ring in the
page background between them, the classic "who is here" cluster. A trailing
avatar with a count reads as an overflow.

```summit
<div class="s-avatar-group">
  <span class="s-avatar">AN</span>
  <span class="s-avatar">GK</span>
  <span class="s-avatar">RB</span>
  <span class="s-avatar">+5</span>
</div>
```

## Copy

```html
<!-- Initials -->
<span class="s-avatar">AN</span>

<!-- Photo -->
<span class="s-avatar">
  <img alt="Ada Lovelace" src="/avatars/ada.jpg" />
</span>

<!-- Stacked group with overflow -->
<div class="s-avatar-group">
  <span class="s-avatar">AN</span>
  <span class="s-avatar">GK</span>
  <span class="s-avatar">+5</span>
</div>
```

## Notes

- Keep initials to one or two characters so they stay centered inside the circle.
- Always give the `<img>` a descriptive `alt`, or an empty `alt=""` when the name
  already appears next to the avatar and the image is decorative.
- The ring around grouped avatars comes from the page background color. Place a
  group on a plain surface so the separation reads clearly.

Pair avatars with [cards](../comp-card/) and [badges](../comp-badge/), or browse
the full set on the [overview](../components/).
