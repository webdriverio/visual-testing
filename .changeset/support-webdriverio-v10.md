---
"@wdio/visual-service": minor
"@wdio/ocr-service": minor
"@wdio/image-comparison-core": patch
---

feat: support WebdriverIO v10 (keep WebdriverIO v9 support)

`@wdio/visual-service` and `@wdio/ocr-service` now run with WebdriverIO v10. WebdriverIO v9 (9.29.1 and later) is still supported. WebdriverIO v10 needs Node.js 22.19 or later.

**What changed**

- The `@wdio/globals`, `@wdio/logger` and `@wdio/types` dependencies accept v9 and v10. `expect-webdriverio` (types only) accepts v5 to v8.
- Multiremote: the services read `isMultiRemote` (v10) and `isMultiremote` (v9). Before, a multiremote session on v10 did not get the visual and OCR commands.
- Multiremote mobile emulation is set on each instance with `instances` and `getInstance()`, which are available in v9 and v10.
- Storybook: the loader uses `execute()` with an `async` function, because v10 removed `executeAsync()`. The clip selector uses `$(selector, { strict: false })`, because `$` is strict in v10.
- Element screenshots: the service gets the browser of an element whose parent is a v10 browsing context.
- Appium `mobile:` commands use `executeScript()`. In a WebDriver BiDi session (Appium 3, required by v10), `execute()` runs the script as page JavaScript.
- When an ignored element was not found, the error now shows the selector and the reason, for example `element "~button-LOGIN" could not be found: StrictSelectorError: ...`. Before, it showed the element as JSON.

**Known limits**

- With `framework: 'jasmine'`, the visual matchers are not available (WebdriverIO v9 and v10). Use the `check*` methods.
- An element screenshot of an element in a frame from `browser.context.frame()` (v10) is not supported.

### Committers: 1

- David Prevost ([@dprevost-LMI](https://github.com/dprevost-LMI))
