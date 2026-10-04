---
"@wdio/visual-service": minor
"@wdio/ocr-service": minor
"@wdio/image-comparison-core": patch
---

feat: support WebdriverIO v10 (keep WebdriverIO v9 support)

`@wdio/visual-service` and `@wdio/ocr-service` now run with WebdriverIO v10. WebdriverIO v9 (9.29.1 and later) is still supported. WebdriverIO v10 needs Node.js 22.19 or later.

**What changed**

- The `@wdio/globals`, `@wdio/logger` and `@wdio/types` dependencies accept v9 and v10.
- `expect-webdriverio` is no longer a dependency of `@wdio/visual-service`. The service uses only its `ExpectWebdriverIO` types, which your `@wdio/globals` gives. This removes a second `expect-webdriverio` copy and peer dependency warnings (for example with pnpm).
- Multiremote: the services read `isMultiRemote` (v10) and `isMultiremote` (v9). Before, a multiremote session on v10 did not get the visual and OCR commands.
- Multiremote mobile emulation is set on each instance with `instances` and `getInstance()`, which are available in v9 and v10.
- Chrome and Edge `mobileEmulation.deviceName` in a WebDriver BiDi session: in v10, `emulate('device')` can fail (for example `emulation.setTextLayoutModeOverride` is not supported by Chrome 154), and the service setup then stopped, so the visual matchers were missing. The service now sets the viewport and the device pixel ratio of the device that the browser emulates, so the screenshots keep the resolution of the device. In v9 nothing changes.
- Storybook: the loader uses `execute()` with an `async` function, because v10 removed `executeAsync()`. The clip selector uses `$(selector, { strict: false })`, because `$` is strict in v10.
- Element screenshots: the service gets the browser of an element whose parent is a v10 browsing context.
- Appium `mobile:` commands use `executeScript()`. In a WebDriver BiDi session (Appium 3, required by v10), `execute()` runs the script as page JavaScript.
- Jasmine: the visual matchers (`toMatchScreenSnapshot` and the others) now work with `framework: 'jasmine'`, in WebdriverIO v9 and v10. Before, they were never added, because the Jasmine `expect` has no `extend()`. The service now adds them as Jasmine async matchers.
- When the matchers cannot be added, the warning now gives the reason. Before, it always said "Expect package not found".
- When the service cannot add its commands (for example when a WebDriver command of its setup fails), the visual matchers are still added, the service logs the reason, and a matcher fails with `The visual service did not add the "checkScreen" command to this session`. Before, the only error was `expect(...).toMatchScreenSnapshot is not a function`.
- When an ignored element was not found, the error now shows the selector and the reason, for example `element "~button-LOGIN" could not be found: StrictSelectorError: ...`. Before, it showed the element as JSON.

**Known limits**

- In a WebDriver BiDi session, an element screenshot of an element in a frame is not supported: with WebdriverIO v9 `switchFrame()` the image is moved by the position of the frame, and with v10 `context.frame()` the command fails. With WebDriver Classic (`'wdio:enforceWebDriverClassic': true`), it works with v9 and v10. See #1228.

**Upgrading to WebdriverIO v10**

- In WebdriverIO v10, `$()` throws a `StrictSelectorError` when the selector finds more than one element. This applies to elements in `ignore` and to `checkElement()` / `toMatchElementSnapshot()`. Use `$$()`, `$(selector, { strict: false })` or a more specific selector. `hideElements` and `removeElements` are not affected.

### Committers: 1

- David Prevost ([@dprevost-LMI](https://github.com/dprevost-LMI))
