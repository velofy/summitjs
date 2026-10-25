# Error codes

> Every diagnostic code Summit prints to the console, what causes it, and where the docs link in each message points.

Summit writes its diagnostics so that a person or an AI agent can fix the
problem on the next try. Each message carries a stable code, a plain-language
cause, a hint when one fits, the offending expression and element, and a link
to the docs page for the directive involved.

## Message format

Warnings go to `console.warn` and failures to `console.error`. Every message
starts with the literal `[summit]` prefix, so tooling that searches for it keeps
working.

```text
[summit] E201: unknown directive "s-modle".
  Did you mean "s-model"?
  element: <input#email>
  docs: https://github.com/velofy/summitjs/blob/main/content/s-model.md
```

The lines are:

- `[summit] CODE: message`, always present.
- A hint line, when Summit has a suggestion or a fix.
- `expression:` with the failing expression, when there is one.
- `element:` with the tag, id, and up to two classes of the element involved.
- `docs:` with a link to the most relevant page.

When the problem was a thrown error, the original error is logged after the
formatted message.

For an unknown directive, Summit compares the name against every registered
directive and suggests the closest one within a small edit distance. The same
unknown name is reported only once, so a repeated typo does not flood the
console.

## Codes

| Code | Level | Meaning |
| --- | --- | --- |
| E101 | error | An `s-data` `init()` method threw. |
| E102 | error | An `s-data` `destroy()` method threw. |
| E103 | error | A store's `init()` method threw. |
| E104 | error | An `s-data` expression could not be evaluated. |
| E201 | warning | Unknown directive; suggests the closest real one. |
| E301 | error | A directive or event handler failed while evaluating its expression. |
| E401 | warning | `s-for` is not on a `<template>` element. |
| E402 | warning | An `s-for` `<template>` has no root element. |
| E501 | warning | `s-teleport` is not on a `<template>` element. |
| E502 | warning | The `s-teleport` target selector matched nothing. |
| E601 | error | A cleanup callback threw during teardown. |
| E602 | error | A `destroy()` callback threw during teardown. |

## Details

### E101 and E102

The component's `init()` or `destroy()` method threw. Summit logs the thrown
error after the message. See [s-data](https://github.com/velofy/summitjs/blob/main/content/s-data.md) and [Lifecycle](https://github.com/velofy/summitjs/blob/main/content/lifecycle.md).

### E103

A store registered with `Summit.store` has an `init()` method that threw. See
[Summit.store](https://github.com/velofy/summitjs/blob/main/content/globals-store.md).

### E104

The `s-data` expression could not be evaluated, for example because the object
uses syntax the interpreter does not support, such as an `async` method. The
component starts with empty state, and the rest of the page still initializes.
See [s-data](https://github.com/velofy/summitjs/blob/main/content/s-data.md).

### E201

An attribute looks like a directive (`s-*`, `@*`, or `:*`) but nothing handles
it. When a close match exists, the hint reads `Did you mean "s-..."?` and the
docs link points at that directive. Otherwise the link points at
[Getting Started](https://github.com/velofy/summitjs/blob/main/content/start.md).

### E301

A directive or an `s-on` handler threw while evaluating its expression. The hint
is a reminder that every name in the expression must be state from an enclosing
`s-data`, a `$` magic, or an allowed global. See
[The CSP-safe evaluator](https://github.com/velofy/summitjs/blob/main/content/advanced-evaluator.md). The docs link names the
directive's own page, so for a directive you registered yourself it points at a
page that does not exist.

### E401 and E402

`s-for` must sit on a `<template>` element, and that template needs exactly one
root element. E402 fires when the template has no element inside it; Summit
repeats only the first element child. See [s-for](https://github.com/velofy/summitjs/blob/main/content/s-for.md).

### E501 and E502

`s-teleport` must sit on a `<template>` element, and its value must be a
selector that matches an element in the document. See
[s-teleport](https://github.com/velofy/summitjs/blob/main/content/s-teleport.md).

### E601 and E602

A cleanup callback or a `destroy()` callback threw while an element was being
removed. See [Lifecycle](https://github.com/velofy/summitjs/blob/main/content/lifecycle.md).

## Messages without a code

The optional data layer prints two plain warnings:

- `[summit] summit-net.min.js must load after summit.min.js.` The CDN build of
  `summitjs/net` could not find `window.Summit`. Load the core script first.
- `[summit] s-resource needs a name` An `s-resource` directive was used without
  a name, as in `s-resource="..."` instead of `s-resource:users="..."`. See
  [Data Fetching](https://github.com/velofy/summitjs/blob/main/content/advanced-data.md).
