---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

## #1146 Fix BiDi element screenshots missing composited layers (scrollbars, fixed/sticky overlays)

### Root cause

When `checkElement` / `saveElement` is used with the WebDriver BiDi protocol, the screenshot was taken with `browsingContext.captureScreenshot` using `origin: 'document'`. This renders the document layout independently of the browser's compositor, which means **composited layers are never included** — element-level scrollbars, `position: fixed` / `position: sticky` overlays, and elements with a `will-change` CSS property all render as invisible or without their correct visual state.

The switch to `origin: 'document'` was introduced in an earlier fix (commit `227f10a`) to avoid a `zero dimensions` error that occurred when `origin: 'viewport'` was used for elements that were outside the visible viewport. That fix was correct for out-of-viewport elements, but it also silently broke composited-layer capture for all elements.

### Fix: new `biDiOrigin` method option

A new **method-level** option `biDiOrigin` has been added to `saveElement` / `checkElement`. It is BiDi-only and ignored for the legacy WebDriver screenshot path.

| Value | Behaviour |
|---|---|
| `'document'` *(default)* | Previous behaviour — works for any element position but composited layers (scrollbars, overlays, `will-change`) are not captured |
| `'viewport'` | Captures the composited frame as the browser painted it — scrollbars, fixed/sticky overlays and `will-change` layers are included. The element must be visible in the viewport; descriptive errors are thrown when it is not |

#### Usage

```ts
// Capture an element with its scrollbar / overlay visible:
await browser.checkElement(element, 'myTag', { biDiOrigin: 'viewport' })
await browser.saveElement(element, 'myTag', { biDiOrigin: 'viewport' })
```

#### Error messages when `biDiOrigin: 'viewport'` cannot produce a valid screenshot

**Element larger than the viewport** — must fall back to `'document'`:
```
[BiDi viewport screenshot] The element dimensions (1400x800px) exceed the viewport (1280x720px).
You must use the default `biDiOrigin: 'document'` for this element.
Note: with `'document'` origin, composited layers such as scrollbars, fixed/sticky overlays,
and elements using `will-change` may not appear in the screenshot.
```

**Element not in the viewport at all** — needs scrolling:
```
[BiDi viewport screenshot] The element is not in the viewport
(element: x=0, y=900, 300x200px; viewport: 1280x720px).
Call `element.scrollIntoView()` before taking the screenshot, or set `autoElementScroll: true`.
```

**Element partially outside the viewport but fits** — needs to be scrolled fully into view:
```
[BiDi viewport screenshot] The element is not fully visible in the viewport
(element: x=-20, y=100, 300x200px; viewport: 1280x720px).
The element fits within the viewport — scroll it fully into view by calling
`element.scrollIntoView()` or setting `autoElementScroll: true`.
```

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
