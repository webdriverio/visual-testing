---
"@wdio/image-comparison-core": patch
---

## #1129 Fix `TypeError: element.getBoundingClientRect is not a function` when a `ChainablePromiseElement` is passed to `checkElement`

When `checkElement` (or `saveElement`) was called with a `ChainablePromiseElement` — the lazy promise-based element reference that WebdriverIO's `$()` returns — the element was passed directly as an argument to `browser.execute()` without being awaited first. `browser.execute()` serializes its arguments for transfer to the browser context and cannot handle a pending Promise, so it arrived in the browser as a plain empty object `{}` instead of a WebElement reference. This caused `element.getBoundingClientRect is not a function` because the browser-side `scrollElementIntoView` script received `{}` rather than a DOM element.

### Changes

- **Resolve element before `browser.execute()`:** both the BiDi path (`takeBiDiElementScreenshot`) and the WebDriver path (`takeWebDriverElementScreenshot`) now await the element once at the top of the function — `await (options.element as unknown as WebdriverIO.Element | Promise<WebdriverIO.Element>)` — before it is used as a `browser.execute()` argument or passed to `takeWebElementScreenshot`. This mirrors the existing pattern already used in `saveWebElement.ts`.
- **Tighten `ElementScreenshotDataOptions.element` type:** changed from `any` to `HTMLElement | WebdriverIO.Element | ChainablePromiseElement`, making the Promise-or-resolved union explicit and consistent with the `WicElement` type used in the public-facing `InternalSaveElementMethodOptions` / `InternalCheckElementMethodOptions` interfaces.
- **New unit tests:** added two regression tests (one per screenshot path) that pass a `Promise.resolve(element)` as the element and assert that the resolved element — not the Promise — reaches `browser.execute()` and `takeWebElementScreenshot`.

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
