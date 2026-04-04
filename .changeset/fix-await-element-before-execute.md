---
"@wdio/image-comparison-core": patch
---

## #1129 Fix `TypeError: element.getBoundingClientRect is not a function` when a `ChainablePromiseElement` is passed to `checkElement`

When `checkElement` (or `saveElement`) was called with a `ChainablePromiseElement`, the lazy promise-based element reference that WebdriverIO's `$()` returns, the element was passed directly as an argument to `browser.execute()` without being awaited first. `browser.execute()` serializes its arguments for transfer to the browser context and cannot handle a pending Promise, so it arrived in the browser as a plain empty object `{}` instead of a WebElement reference. This caused `element.getBoundingClientRect is not a function` because the browser-side `scrollElementIntoView` script received `{}` rather than a DOM element.

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
