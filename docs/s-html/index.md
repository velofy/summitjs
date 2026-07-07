# s-html

> Set an element's innerHTML from an expression.

`s-html` sets an element's `innerHTML` to the value of an expression and re-runs
when that value changes. Reach for it when the content itself is markup, for
example a fragment rendered on the server or returned from a fetch.

```summit
<div s-data="{ note: '<strong>Saved</strong> just now' }">
  <p s-html="note"></p>
</div>
```

Unlike [s-text](../s-text/), the string is parsed as HTML, so the `<strong>`
above becomes real bold text.

## Injected markup is initialized

After setting the HTML, Summit walks the new children and initializes any Summit
directives it finds, using the surrounding component's scope. A fragment that
arrives with `s-text` or `@click` on it becomes reactive right away, with no
extra step.

## Only use it on trusted content

**Setting `innerHTML` from untrusted input is an XSS vulnerability.** A string
containing a `<script>` tag or an `onerror` handler can run code in your page.
Never point `s-html` at anything a user typed, a URL parameter, or a third-party
response you do not control.

If the source is not fully trusted, use [s-text](../s-text/) instead, which
escapes everything it renders.
