# Breadcrumb

> Show the path to the current page.

A breadcrumb shows where the current page sits in your hierarchy and lets people
step back up it. It is pure markup: a `<nav>` labeled for assistive tech, a chain
of links, and a plain `.s-sep` between each one. The last item is the current
page, so it is text rather than a link.

## The trail

Each ancestor is a normal `<a>`, separated by a `<span class="s-sep">`. The final
crumb carries `aria-current="page"` and no link, which both styles it as the
current location and tells screen readers they have arrived.

```summit
<nav class="s-breadcrumb" aria-label="Breadcrumb">
  <a href="#">Home</a><span class="s-sep">/</span>
  <a href="#">Components</a><span class="s-sep">/</span>
  <span aria-current="page">Breadcrumb</span>
</nav>
```

```html
<nav class="s-breadcrumb" aria-label="Breadcrumb">
  <a href="#">Home</a><span class="s-sep">/</span>
  <a href="#">Components</a><span class="s-sep">/</span>
  <span aria-current="page">Breadcrumb</span>
</nav>
```

## Notes

- Mark the last crumb with `aria-current="page"`. It is the one visual and
  assistive-tech signal that this crumb is where you are, and the stylesheet
  keys its stronger color off that attribute.
- Give the `<nav>` an `aria-label` such as `Breadcrumb` so it is announced as a
  distinct landmark separate from your main navigation.
- The separator is decorative. Keeping it in its own `.s-sep` span leaves the
  links clean and lets you swap the character (a slash, a chevron) in one place.
- The trail is static markup, so it drops into any page as-is. To render it from
  a route array, wrap the crumbs in a [s-for](../s-for/) and mark the final item
  with `aria-current`.

To move through pages of results rather than up a hierarchy, see
[Pagination](../comp-pagination/). The whole set is on the
[overview](../components/).
