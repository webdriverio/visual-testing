# @wdio/image-comparison-core

## 3.0.0

### Major Changes

- 104fb89: feat!: support WebdriverIO v10 only
  
  All changes that users can notice in v11, also the fixes in `@wdio/image-comparison-core` 3.0.0, are in the [v11 migration guide](https://github.com/webdriverio/visual-testing/blob/main/docs/v11-migration.md).
  
  `@wdio/visual-service` v11, `@wdio/image-comparison-core` v3 and `@wdio/ocr-service` v3 support only WebdriverIO v10. WebdriverIO v10 needs Node.js 22.19 or later.
  
  **What changed**
  
  - The `@wdio/globals`, `@wdio/logger` and `@wdio/types` dependencies are now `^10.0.0` (before: `^9.29.1 || ^10.0.0`).
  - The code paths for WebdriverIO v9 are removed. For example, a multiremote browser or element is found only with the `isMultiRemote` flag of WebdriverIO v10, not with the `isMultiremote` flag of WebdriverIO v9.
  - The visual service finds the browser of an element, and a multiremote element, with the kind brand of WebdriverIO v10 (`Symbol.for('wdio.kind')`). `toMatchElementSnapshot()` gives a clear error for a value that is not a WebdriverIO v10 element.
  
  **If you use WebdriverIO v9**
  
  Stay on `@wdio/visual-service@10`, `@wdio/image-comparison-core@2` and `@wdio/ocr-service@2`. They are in maintenance on the `v10` branch, and fixes are backported on request.
- e9aa654: feat: compare images with pixelmatch 8 (OKLab/HyAB color distance)
  
  The comparison engine is now pixelmatch 8. It measures color differences in the OKLab color space with the HyAB distance instead of YIQ, which is closer to how people see colors: fewer false positives and fewer missed changes.
  
  The threshold scale did not change (`0` to `1`, where `1` is black vs white), so the `ignore*` presets keep their values. But **mismatch percentages can differ a little** from v10 for the same images. On real screenshots the number of different pixels changed by about −3 % to +3 % (for a 1-pixel shift of a full page with `ignoreAntialiasing`: 0.002 % → 0.003 %). If a check depends on an exact mismatch percentage or a tight tolerance, check it again after the upgrade.

### Patch Changes

- df78eb9: fix: clip the right area for element screenshots with `biDiOrigin: 'viewport'`
  
  With `biDiOrigin: 'viewport'`, an element screenshot in a WebDriver BiDi session used the position of the element on the page (`getElementRect`) as its position in the viewport. When the page was scrolled, for example by `autoElementScroll`, the screenshot either failed with "The element is not in the viewport" (an element below the first viewport) or, without an error, showed another part of the page. The clip now uses the position of the element in the viewport.
- e79530b: fix: a clear error, and no endless screenshots, for a mobile full page screenshot without a viewport height
  
  The visual service measures the viewport of a mobile browser at the start of the session with a native tap. When this measurement failed (for example on a black emulator screen), the viewport height was 0, and a mobile full page screenshot then failed with "Negative scroll position detected (scrollY: -12)", or, with both shadow paddings set to 0, took screenshots without end. It now fails at once with an error that says that the viewport measurement failed. A viewport that is smaller than the shadow paddings also gets a clear error.
- 893242a: fix: the published type declarations import other declarations with relative paths
  
  Five type declaration files imported other files with paths like `src/methods/images.interfaces.js`. Those paths only worked inside this repository, so in a user's project TypeScript could not resolve them, and types such as `TestContext`, `CompareData` and `ElementIgnore` became `any` (or caused `Cannot find module 'src/…'` errors without `skipLibCheck`). The imports are now relative.
- e9c18f9: fix: declare `webdriverio` as a peer dependency
  
  `@wdio/visual-service` and `@wdio/ocr-service` import `webdriverio` at runtime, and the types of `@wdio/image-comparison-core` use the `webdriverio` types, but the packages did not declare it. They now have the peer dependency `webdriverio: ^10.0.0`. A WebdriverIO project always has `webdriverio` installed, so no change is needed in your project.
- be8f022: fix: scroll back to the old position after an element screenshot, also at the top of the page
  
  With `autoElementScroll` (the default), `checkElement()`, `saveElement()` and `toMatchElementSnapshot()` scroll the element into view. When the page was at the top, they did not scroll back, because the position 0 was treated as "no position" (thanks to @theluckystrike for the first fix in #1271). A later viewport check then captured a scrolled page. The scroll back now works in the same way as for full page screenshots: the position is read before the page is prepared (so `removeElements` cannot change it) and restored after the page is restored, also when the screenshot fails. It is instant, also on a page with `scroll-behavior: smooth`. In Safari (macOS and iOS), the element and full page commands now wait until Safari keeps and shows the position (about 100 ms): before, a screenshot right after the command could still show the old position in Safari on macOS. Fixes #1229.
- c136ea8: fix: scroll back to the old position after a full page screenshot
  
  When the full page screenshot is made by scrolling and joining viewport screenshots (WebDriver Classic, and Android and iOS mobile web), `checkFullPageScreen()`, `saveFullPageScreen()` and `toMatchFullPageSnapshot()` left the page at the bottom, and the tabbable commands left it at the top or at the bottom. A later viewport check then captured a scrolled page. The page is now scrolled back to the position that it had before the command. The position is read before the page is prepared (so `removeElements` cannot change it) and restored after the page is restored, also when the screenshot fails. The scroll back is instant, also on a page with `scroll-behavior: smooth`. On iOS, Safari can put back the old position for a moment after the page is restored, so the command waits until the page stays at the position (about 150 ms). Fixes #1231.
- ee3a8a9: fix: hide the `hideAfterFirstScroll` elements before the scroll wait of a full page screenshot
  
  The elements of `hideAfterFirstScroll` were hidden after the `fullPageScrollTimeout` wait, just before the screenshot. On a slow device or emulator, the page was not drawn again in time, so the screenshot could still show them (for example a sticky header in the second part of the full page image). They are now hidden before the wait, so the page has the whole wait to be drawn again. This applies to desktop, Android and iOS full page screenshots.
- fd38751: fix: find an ignore element again only when its reference is stale
  
  Before, the region of each `ignore` element was read with `browser.execute(script, element)`, and every element was first found again with `$$` (one query for each selector and scope), even when its reference was still valid. Now the region is read with the element command `element.execute(script)`. When the browser says that the reference is stale (for example after a DOM change by the `beforeScreenshot` style injection), WebdriverIO finds the element again with its full chain (parent, index of a `$$` list, browsing context) and runs the script again. This removes the extra queries, and an element is found again in the same way as for all other WebdriverIO element commands.
- 06a7ad5: fix: no transparent (black) area in iOS element screenshots of elements larger than the viewport
  
  In iOS Safari, the Appium element screenshot of an element that is not fully inside the viewport has the size of the whole element, but only the visible part has pixels; the rest is transparent and shows as black (#1127, https://github.com/appium/appium/issues/22939). Until Appium fixes it, the service cuts the visible part of such an element from a screenshot, as it already does on Android. Elements that are fully inside the viewport do not change.
- 536ad6e: fix: measure the iOS viewport again when a Safari tip takes the native tap
  
  To find the position of the webview, the service loads a test page with an overlay and makes a native tap in the center of the screen. On the first Safari start of a new simulator or device (for example in CI), iOS 26 shows a tip ("View Bookmarks, Share Menu, and Open Tabs"). The tap only closed that tip and did not reach the overlay. The service then used an empty viewport (0x0), and full page screenshots failed with "Negative scroll position detected". The service now checks the measurement on iOS too, as it already did on Android, and measures again (up to 3 attempts).
- 5557e9e: chore: declare Node.js `>=22.19.0`, the same as WebdriverIO 10
  
  All packages now declare `"engines": { "node": ">=22.19.0" }`, like every package of WebdriverIO 10.
  
  - `@wdio/image-comparison-core`, `@wdio/visual-service` and `@wdio/ocr-service` did not declare a Node.js version, but they already needed 22.19 or newer through WebdriverIO 10.
  - `@wdio/visual-reporter` declared `>=20.0.0`. Node.js 20 is end-of-life, and the reporter CLI is used together with WebdriverIO 10, so it now also needs Node.js 22.19 or newer.
- c1db350: refactor: skip ignored regions with pixelmatch's `ignoreMask`
  
  Ignored regions (ignored elements and block-outs) are now skipped by pixelmatch itself instead of being painted black in both images before the comparison. The baseline, actual and diff files do not change, and the diff image still shows the ignored regions in green. The pixels next to an ignored region are now compared with their real neighbours: with `ignoreAntialiasing`, the anti-aliasing detection at the edge of an ignored region can give a slightly different count (for example 15 more pixels out of 61 208 on a real screenshot).
  
  A region that goes past the right edge of the image is now cut at the edge. Before, the part outside the image continued on the left side of the next pixel rows, so those pixels were also ignored by mistake, and a real difference there was not found.
- 84d2749: fix: full page screenshots in Safari desktop on a screen with a device pixel ratio above 1
  
  In Safari desktop (WebDriver Classic), each part of a full page screenshot is put right after the previous one. The position of the previous part was already in device pixels and was converted again, so on a Retina screen (device pixel ratio 2) the positions doubled with each part: most parts were outside the image, and the image had black areas and repeated parts. The position is now counted in CSS pixels. With a device pixel ratio of 1 the image does not change.
- 6a52570: fix: draw the tab stops of editable content, image maps, scroll containers and dialogs as the browsers have them
  
  `checkTabbablePage()`, `saveTabbablePage()` and `toMatchTabbablePageSnapshot()` now also follow the Tab key of the browser for these cases (checked with the real Tab key in Chrome, Edge, Firefox and Safari):
  
  - an element with `contenteditable="plaintext-only"` (and the other editing hosts) is a tab stop; a link without a `tabindex` in editable content and an editable element in editable content are not;
  - the areas (`<area href>`) of an image map that a rendered image uses are tab stops at the place of the map, drawn at the center of their shape on the image;
  - a scroll container is a tab stop as the browser engine has it: in Chrome and Edge (130 and newer) when no tab stop is in it, in Firefox always, in Safari never;
  - with a modal dialog only the top modal dialog can get the focus, and the drawing is in the top layer, above the dialog. In Firefox and Safari an open dialog is a tab stop itself;
  - a page in design mode has only the `body` as tab stop in Chrome and Edge, and no tab stop in Firefox and Safari; an editable `html` or `body` is not a tab stop in Firefox;
  - `audio` and `video` elements with controls are tab stops also in Safari, which gives them `tabIndex` -1.
  
  Where browsers do not agree on other cases, the tab order of Chrome is used.
- 172b1a8: fix: draw the real tab order in the tabbable commands, also through shadow DOM
  
  `checkTabbablePage()`, `saveTabbablePage()` and `toMatchTabbablePageSnapshot()` now draw the tab stops in the order of the Tab key of the browser:
  
  - the elements in open shadow roots, at the place of their host, and the elements in slots, in the order of the slots (#515);
  - a positive `tabindex` in a shadow root is sorted only in that shadow root, a shadow host or slot with a negative `tabindex` is skipped with its content, and a host that delegates the focus is not a tab stop itself;
  - the `html` and `body` elements are tab stops when they have a `tabindex` (or `body` is `contenteditable`);
  - elements with `position: fixed` are no longer left out;
  - SVG links (also with `xlink:href`) and SVG and MathML elements with a `tabindex` are tab stops, also in shadow roots, and not when they are hidden;
  - a `details` element is sorted like a shadow host: its summary is a tab stop and the content of a closed `details` element is not, a `details` element is a tab stop itself when it has no summary or has a `tabindex`, and a negative `tabindex` skips its summary and content;
  - elements in an `inert` subtree (also an `inert` `body` or `html` element) or in a disabled `fieldset` are left out;
  - a radio group has one tab stop: the checked radio input, or else the first radio input of the group in the tab order. The group uses the form owner (also with the `form` attribute), the name, and the document or shadow root of the radio input. Where browsers do not agree, the order of Chrome is used.
  
  The content of closed shadow roots and of iframes can not be read from the page, so it is still not drawn.

## 2.1.2

### Patch Changes

- 525a75a: chore: accept the WebdriverIO 10 releases instead of the 10.0.0 prereleases

  The `@wdio/globals`, `@wdio/logger` and `@wdio/types` ranges change from `^9.29.1 || ^10.0.0-0` to `^9.29.1 || ^10.0.0`. WebdriverIO 10.0.0 is released, so the alpha versions are no longer accepted. WebdriverIO v9 (9.29.1 and later) is still supported.

## 2.1.1

### Patch Changes

- c1a5b84: feat: support WebdriverIO v10 (keep WebdriverIO v9 support)

  `@wdio/visual-service` and `@wdio/ocr-service` now run with WebdriverIO v10. WebdriverIO v9 (9.29.1 and later) is still supported. WebdriverIO v10 needs Node.js 22.19 or later.

  **What changed**

  - The `@wdio/globals`, `@wdio/logger` and `@wdio/types` dependencies accept v9 and v10.
  - `expect-webdriverio` is no longer a dependency of `@wdio/visual-service`. The service uses only its `ExpectWebdriverIO` types, which your `@wdio/globals` gives. This removes a second `expect-webdriverio` copy and peer dependency warnings (for example with pnpm).
  - Multiremote: the services read `isMultiRemote` (v10) and `isMultiremote` (v9). Before, a multiremote session on v10 did not get the visual and OCR commands.
  - Multiremote mobile emulation is set on each instance with `instances` and `getInstance()`, which are available in v9 and v10.
  - Multiremote: the commands of each instance (for example `browser.getInstance('chrome').checkScreen()`) use the context of that instance. Before, all instances used the context of the last instance, so with a web instance and a native app instance, the web check ran as a native app check and saved a `...-NaNxNaN.png` file.
  - Chrome and Edge `mobileEmulation.deviceName` in a WebDriver BiDi session: in v10, `emulate('device')` can fail (for example `emulation.setTextLayoutModeOverride` is not supported by Chrome 154), and the service setup then stopped, so the visual matchers were missing. The service now sets the viewport and the device pixel ratio of the device that the browser emulates, so the screenshots keep the resolution of the device. In v9 nothing changes.
  - Storybook: the loader uses `execute()` with an `async` function, because v10 removed `executeAsync()`. The clip selector uses `$(selector, { strict: false })`, because `$` is strict in v10.
  - Element screenshots: the service gets the browser of an element whose parent is a v10 browsing context.
  - Appium `mobile:` commands use `executeScript()`. In a WebDriver BiDi session (Appium 3, required by v10), `execute()` runs the script as page JavaScript.
  - Jasmine: the visual matchers (`toMatchScreenSnapshot` and the others) now work with `framework: 'jasmine'`, in WebdriverIO v9 and v10. Before, they were never added, because the Jasmine `expect` has no `extend()`. The service now adds them as Jasmine async matchers.
  - When the matchers cannot be added, the warning now gives the reason. Before, it always said "Expect package not found".
  - When the service cannot add its commands (for example when a WebDriver command of its setup fails), the visual matchers are still added, the service logs the reason, and a matcher fails with `The visual service did not add the "checkScreen" command to this session`. Before, the only error was `expect(...).toMatchScreenSnapshot is not a function`.
  - When an ignored element was not found, the error now shows the selector and the reason, for example `element "~button-LOGIN" could not be found: StrictSelectorError: ...`. Before, it showed the element as JSON.
  - `ignore` elements: before the comparison, each element is found again in its own scope (the element or browsing context it was found from) and at its own index. Before, the service searched the whole page with the selector and took the elements in order, so an element of a filtered `$$().filter()` list, of a chained `$('form').$$('input')` query or of a frame could be replaced by another element with the same selector.

  **Known limits**

  - In a WebDriver BiDi session, an element screenshot of an element in a frame is not supported: with WebdriverIO v9 `switchFrame()` the image is moved by the position of the frame, and with v10 `context.frame()` the command fails. With WebDriver Classic (`'wdio:enforceWebDriverClassic': true`), it works with v9 and v10. See #1228.

  **Upgrading to WebdriverIO v10**

  - In WebdriverIO v10, `$()` throws a `StrictSelectorError` when the selector finds more than one element. This applies to elements in `ignore` and to `checkElement()` / `toMatchElementSnapshot()`. Use `$$()`, `$(selector, { strict: false })` or a more specific selector. `hideElements` and `removeElements` are not affected.

  ### Committers: 1

  - David Prevost ([@dprevost-LMI](https://github.com/dprevost-LMI))

## 2.1.0

### Minor Changes

- b194642: fix: ignore\* option parity with resemble (pixelmatch)

  After v10 switched to pixelmatch, the public `ignore*` API did not fully match resemble.js preset behaviour. Combined modes such as `ignoreLess` with the default `ignoreAntialiasing: true` still inherited AA forgiveness, and `ignoreColors` used BT.601 grayscale instead of resemble brightness-only comparison.

  This release also adds `compareOptions.pixelmatch` so you can pass pixelmatch settings directly instead of using `ignore*` presets.

  **What changed**

  - Multiple `ignore*` flags now follow resemble last-wins ordering (`ignoreAlpha` → `ignoreAntialiasing` → `ignoreColors` → `ignoreLess` → `ignoreNothing`) instead of composing independently
  - `ignoreLess`, `ignoreAlpha`, `ignoreColors`, and `ignoreNothing` now apply their own threshold and AA rules when active; they no longer inherit default `ignoreAntialiasing: true` forgiveness
  - `ignoreColors` now compares brightness only using resemble luma weights (`0.3/0.59/0.11`), matching resemble v9 behaviour
  - WDIO logs a warning when multiple `ignore*` flags are enabled, naming which preset wins
  - New `compareOptions.pixelmatch` object for direct pixelmatch control (`threshold`, `includeAA`, `diffColor`, `aaColor`, `diffColorAlt`, `alpha`, `diffMask`, `checkerboard`)

  **Preset reference**

  | Active preset                  | threshold | AA forgiven          |
  | ------------------------------ | --------- | -------------------- |
  | `ignoreNothing`                | 0         | no                   |
  | `ignoreLess`                   | ~16/255   | no                   |
  | `ignoreColors`                 | ~16/255   | no (brightness only) |
  | `ignoreAlpha`                  | ~16/255   | no                   |
  | `ignoreAntialiasing` (default) | ~32/255   | yes                  |

  **Using `compareOptions.pixelmatch`**

  Set it in your service config or on a single `check*` call. Do not put `ignore*` keys and `pixelmatch` on the same options object; that throws, even when an `ignore*` flag is `false`. Service config and method options are separate objects, so a method call can override the service compare mode for that check (a warning is logged when the mode switches).

  Service config:

  ```js
  // wdio.conf.js
  services: [
    [
      "visual",
      {
        compareOptions: {
          pixelmatch: {
            threshold: 0.063,
            includeAA: true,
          },
        },
      },
    ],
  ];
  ```

  Method override when the service uses `ignore*` presets:

  ```js
  await browser.checkScreen("homepage", {
    pixelmatch: { threshold: 0.05 },
  });
  ```

  Method override when the service uses `pixelmatch`:

  ```js
  await browser.checkScreen("homepage", {
    ignoreLess: true,
  });
  ```

  Invalid (throws):

  ```js
  compareOptions: {
    ignoreLess: false,
    pixelmatch: { threshold: 0.063 },
  }
  ```

  See [pixelmatch](https://github.com/mapbox/pixelmatch) for option details.

  **What you need to do**

  - No change needed if you use a single `ignore*` flag or rely on defaults (`ignoreAntialiasing: true`)
  - Set `ignoreAntialiasing: false` when anti-aliased pixels should count as differences
  - If you combine multiple `ignore*` flags, review your tests; last-wins ordering now matches resemble v9
  - If you use `ignoreColors`, results may differ slightly from early v10 but align with resemble v9
  - To tune pixelmatch directly, add `compareOptions.pixelmatch` in your service config or pass `pixelmatch` on individual `check*` calls

## 2.0.1

### Patch Changes

- 8cbb294: fix: wire ignoreAntialiasing to pixelmatch AA forgiveness toggle

  In v10 the pixelmatch engine always ran with anti-aliasing forgiveness enabled, even when `ignoreAntialiasing` was `false`. The option had no effect on comparison behaviour.

  **What changed**

  - `ignoreAntialiasing` now toggles pixelmatch's AA handling: `true` forgives anti-aliased pixels, `false` counts them as mismatches.
  - The default is now `ignoreAntialiasing: true`, matching the forgiving pixelmatch behaviour users already get in v10.
  - `ignoreLess` and `ignoreNothing` keep their own threshold behaviour; AA forgiveness is controlled independently via `ignoreAntialiasing`.

  **Migration**

  - No action needed if you rely on the current forgiving defaults, comparison behaviour stays the same.
  - If you explicitly set `ignoreAntialiasing: true` today, that remains redundant but harmless.
  - Set `ignoreAntialiasing: false` when you need strict comparison where anti-aliased pixels count as differences.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 2.0.0

### Major Changes

- d2758ce: ### 💥 Breaking change: new image comparison engine

  We replaced the engine that powers every visual comparison. This is a breaking change, so please read the migration note below before upgrading.

  **The problem**

  Visual tests were flaky. Tests failed on differences that are impossible to see by eye, like sub-pixel font rendering, 1px anti-aliasing on edges and small shadow shifts between runs. The old engine (resemble.js) compared raw RGB values, which does not match how human vision works, and on larger screenshots it quietly skipped about a third of the pixels. So you got failures that were not real, and in some cases real changes that could slip through.

  On top of that, all the image handling (decode, crop, composite, rotate, resize) ran through [`jimp`](https://github.com/jimp-dev/jimp), a large dependency that we only used a small slice of and that is no longer actively maintained.

  **The solution**

  Two things changed under the hood:

  1. The comparison engine is now [pixelmatch](https://github.com/mapbox/pixelmatch). It compares images the way the eye perceives them (in the YIQ colour space) and detects anti-aliasing by checking both images at once. Invisible rendering noise now passes, and real regressions still fail.
  2. `jimp` has been removed completely. PNG decode and encode now go through the small [`fast-png`](https://github.com/image-js/fast-png) library, and the handful of image operations we still need (crop, composite, canvas, opacity, rotate, resize) live in a tiny internal helper. The bundled resemble file is gone too. The net effect is a much lighter dependency footprint with no loss in functionality.

  **What you need to do**

  - Your public API does not change. `checkScreen`, `checkElement`, `checkFullPageScreen` and the matchers all work exactly as before, and the same `ignore` options are supported.
  - Because the new engine measures differences differently, mismatch percentages will not match the old numbers exactly. You should re-run your suite once and re-accept your baselines so they are generated with the new engine. After that your tests should be noticeably more stable.

  **Also fixed in this release**

  - **Top-row artifact on full page screenshots:** Jimp's `contain()` centred the image, shifting content by 1px and creating a false diff across the top row. Replaced with buffer-level padding that anchors content at (0,0).
  - **Ignored region 1px under-coverage:** The device-pixel size of an ignored region used `Math.floor`, which could drop a pixel when `cssSize * DPR` had a fractional part. Width and height now use `Math.ceil` so the full element is always covered. Position still uses `Math.floor`.
  - **Comparison sensitivity matches what you were used to:** Switching engines meant retuning how strict a comparison is. The pixelmatch threshold is now aligned with the old resemble tolerances, so a difference that used to fail still fails and one that used to pass still passes. The diff highlight also uses a single consistent colour instead of varying per run.
  - **Different image sizes no longer crash the comparison:** When a baseline and the actual screenshot had slightly different dimensions, the old flow threw an error and you lost the result. Both images are now normalised to the same size before they are compared, so a size change is reported as a visual difference you can review instead of a hard failure.
  - **More reliable ignore regions with WebDriver BiDi:** With BiDi the calculated element bounds can be off by a pixel or two, which sometimes left part of an ignored element just outside the ignored area and caused a false diff. The BiDi emulated flow now uses a larger `ignoreRegionPadding` so the whole element stays covered.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

### Patch Changes

- 6cd5742: ### Dependency updates

  Updated dependencies across all packages to their latest compatible versions. This includes the WebdriverIO toolchain (`webdriverio`, `@wdio/*`) to `9.29.1`, the TypeScript ESLint plugins to `8.62.0`, Vitest to `3.2.6`, and various other packages such as `sharp`, `@remix-run/*`, `fuse.js` and `expect-webdriverio`. There are no functional or API changes.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.2.4

### Patch Changes

- 60997df: fix: prevent false emulation detection when checkElement is called inside an iframe after switchFrame

  ### Committers: 1

  - Taro.Nonoyama([@n2-freevas](https://github.com/n2-freevas))

## 1.2.3

### Patch Changes

- c56e1ae: ## #1146 Fix BiDi element screenshots missing composited layers (scrollbars, fixed/sticky overlays)

  ### Root cause

  When `checkElement` / `saveElement` is used with the WebDriver BiDi protocol, the screenshot was taken with `browsingContext.captureScreenshot` using `origin: 'document'`. This renders the document layout independently of the browser's compositor, which means **composited layers are never included** — element-level scrollbars, `position: fixed` / `position: sticky` overlays, and elements with a `will-change` CSS property all render as invisible or without their correct visual state.

  The switch to `origin: 'document'` was introduced in an earlier fix (commit `227f10a`) to avoid a `zero dimensions` error that occurred when `origin: 'viewport'` was used for elements that were outside the visible viewport. That fix was correct for out-of-viewport elements, but it also silently broke composited-layer capture for all elements.

  ### Fix: new `biDiOrigin` method option

  A new **method-level** option `biDiOrigin` has been added to `saveElement` / `checkElement`. It is BiDi-only and ignored for the legacy WebDriver screenshot path.

  | Value                    | Behaviour                                                                                                                                                                                                                    |
  | ------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
  | `'document'` _(default)_ | Previous behaviour — works for any element position but composited layers (scrollbars, overlays, `will-change`) are not captured                                                                                             |
  | `'viewport'`             | Captures the composited frame as the browser painted it — scrollbars, fixed/sticky overlays and `will-change` layers are included. The element must be visible in the viewport; descriptive errors are thrown when it is not |

  #### Usage

  ```ts
  // Capture an element with its scrollbar / overlay visible:
  await browser.checkElement(element, "myTag", { biDiOrigin: "viewport" });
  await browser.saveElement(element, "myTag", { biDiOrigin: "viewport" });
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

## 1.2.2

### Patch Changes

- db33fa7: #### `@wdio/image-comparison-core` and `@wdio/ocr-service` Security: update jimp (CVE in `file-type` transitive dep)

  Bumped `jimp` to the latest version to resolve a reported vulnerability in its `file-type` transitive dependency (see [#1130](https://github.com/webdriverio/visual-testing/issues/1130), raised by [@denis-sokolov](https://github.com/denis-sokolov), thank you!).

  **Actual impact on these packages**
  `file-type` is used by `@jimp/core` solely to detect image MIME types when reading a buffer. In both `@wdio/image-comparison-core` and `@wdio/ocr-service`, every image passed to jimp originates from either WebDriver screenshots (browser-controlled base64 data) or local files written by the framework itself. There is no code path where untrusted external input is fed directly into jimp, which removes the exploitability that the CVE describes.

  That said, the reputational and compliance risk was real, security scanners flag the package as vulnerable, enterprise users hit audit failures, and some organisations block installation of packages with known CVEs. The update addresses all of that.

  #### `@wdio/visual-reporter` and `@wdio/visual-service`

  Updated internal dependencies to pick up the jimp bump in `@wdio/image-comparison-core`.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.2.1

### Patch Changes

- d5afb54: ## #1129 Fix `TypeError: element.getBoundingClientRect is not a function` when a `ChainablePromiseElement` is passed to `checkElement`

  When `checkElement` (or `saveElement`) was called with a `ChainablePromiseElement`, the lazy promise-based element reference that WebdriverIO's `$()` returns, the element was passed directly as an argument to `browser.execute()` without being awaited first. `browser.execute()` serializes its arguments for transfer to the browser context and cannot handle a pending Promise, so it arrived in the browser as a plain empty object `{}` instead of a WebElement reference. This caused `element.getBoundingClientRect is not a function` because the browser-side `scrollElementIntoView` script received `{}` rather than a DOM element.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.2.0

### Minor Changes

- 994f4da: ## #857 Support ignore regions for web screenshots

  Add `ignore` support to all web screenshot methods (`saveScreen`/`checkScreen`, `saveElement`/`checkElement`, `saveFullPageScreen`/`checkFullPageScreen`) so that specified elements can be blocked out during visual comparison. This brings web parity with the native-app ignore-region support that already existed.

  ### Changes

  - **Ignore regions for full-page screenshots:** new `determineWebFullPageIgnoreRegions` function that calculates ignore-region rectangles for full-page screenshots, including a `fullPageCropTopPaddingCSS` correction for mobile scroll-and-stitch scenarios where the address-bar shadow padding shifts element positions
  - **Consolidated `ignoreRegionPadding`:** moved `ignoreRegionPadding` into `BaseWebScreenshotOptions` so it is inherited by all web methods instead of being duplicated per method
  - **Fix `isAndroidNativeWebScreenshot` type:** ensure `nativeWebScreenshot` is always a boolean (was accidentally an object for LambdaTest capabilities), preventing ignore-region DPR scaling failures
  - **Fix viewport rounding for mobile:** restore `Math.round()` in `injectWebviewOverlay` and remove `Math.min` clamping in `getMobileViewPortPosition` to prevent 1-pixel crop shifts during full-page stitching
  - **Fix `scrollElementIntoView` for scrolled pages:** account for `currentPosition` (existing scroll offset) when computing the target scroll position, so elements are scrolled into view correctly when the page is already scrolled
  - **Dismiss Chrome Start Surface on Android:** when Chrome's tab-overview UI blocks the webview overlay, automatically press the Android Back button (up to 4 retries) to restore the active tab before measuring the viewport
  - **Add hybrid status bar blockout:** on hybrid apps the statusbar was not blocked out which could result in flaky tests regarding battery and reception

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.1.4

### Patch Changes

- 0a19d78: Fix `clearRuntimeFolder` clearing the actual and diff folders after each spec/feature execution instead of once before all workers start. This caused only the last spec's visual data to be present in the output when running multiple specs.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- ce74703: Stop creating empty diff folders when no visual differences exist. The diff directory is now only created on disk when a diff image is actually saved, instead of being eagerly created during path preparation. Fixes #879.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.1.3

### Patch Changes

- a3bc7a4: ## #1115 Respect `alwaysSaveActualImage: false` for `checkScreen` methods

  When using visual matchers like `toMatchScreenSnapshot('tag', 0.9)` with `alwaysSaveActualImage: false`, the actual image was still being saved even when the comparison passed within the threshold.

  The root cause was that the matcher's expected threshold was not being passed to the core comparison logic. The core used `saveAboveTolerance` (defaulting to 0) to decide whether to save images, while the matcher used the user-provided threshold to determine pass/fail - these were disconnected.

  This fix ensures:

  - When `alwaysSaveActualImage: false` and `saveAboveTolerance` is not explicitly set, actual images are never saved (respecting the literal meaning of the option)
  - When `saveAboveTolerance` is explicitly set (like matchers do internally), actual images are saved only when the mismatch exceeds that threshold

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- a3bc7a4: ## Fix: `save*` methods now always save files regardless of `alwaysSaveActualImage` setting

  Previously, when `alwaysSaveActualImage: false` was set in the configuration, `save*` methods (`saveScreen`, `saveElement`, `saveFullPageScreen`, `saveAppScreen`, `saveAppElement`) were not saving files to disk, causing test failures.

  The `alwaysSaveActualImage` option is intended to control whether actual images are saved during `check*` methods (comparison operations), not `save*` methods. Since `save*` methods are explicitly designed to save screenshots, they should always save files regardless of this setting.

  This fix ensures:

  - `save*` methods always save files to disk, even when `alwaysSaveActualImage: false` is set in the config
  - `alwaysSaveActualImage: false` continues to work correctly for `check*` methods (as intended for issue #1115)
  - The behavior is now consistent: `save*` = always save, `check*` = respect `alwaysSaveActualImage` setting

  **Implementation details:**

  - The visual service overrides `alwaysSaveActualImage: true` when calling `save*` methods directly from the browser API
  - `save*` methods respect whatever `alwaysSaveActualImage` value is passed to them (no special logic needed)
  - `check*` methods pass through the config value (which may be `false`), so `save*` methods respect it when called internally
  - This clean separation ensures `save*` methods work correctly when called directly while still respecting `alwaysSaveActualImage` for `check*` methods

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.1.2

### Patch Changes

- 0a2b6d0: ## #1111 Respect saveAboveTolerance when deciding to save actual images when alwaysSaveActualImage is false.

  When `alwaysSaveActualImage` is `false`, the actual image is no longer written to disk if the mismatch is below the configured tolerance, avoiding extra actuals when the comparison still passes.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.1.1

### Patch Changes

- 340fbe6: # 🐛 Bugfixes

  ## #1098 Improve error message when baseline is missing and both flags are false

  When `autoSaveBaseline = false` and `alwaysSaveActualImage = false` and a baseline image doesn't exist, the error message now provides clear guidance suggesting users set `alwaysSaveActualImage` to `true` if they need the actual image to create a baseline manually.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- e4e5b5c: # 🐛 Bugfixes

  ## #1085 autoSaveBaseline collides with the new alwaysSaveActualImage flag

  When `autoSaveBaseline` is `true` and `alwaysSaveActualImage` is `false`, actual images were still saved. This patch should fix that

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.1.0

### Minor Changes

- bde4851: This PR will implement FR #1077 which is asking not to create the actual image on success. This should create a better performance because no files are writing to the system and should make sure that there's not a lot of noise in the actual folder.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.0.2

### Patch Changes

- 8ff1bc3: # 🐛 BugFix

  ## #1078: Cursor inside shadow is shown, even with disableBlinkingCursor

  Fix option "disableBlinkingCursor" to also work within shadowdom

  # Committers: 1

  - Carlo Jeske ([@plusgut](https://github.com/plusgut))

## 1.0.1

### Patch Changes

- 79d2b1d: # 🐛 Bugfixes

  ## #1073 Normalize Safari desktop screenshots by trimming macOS window corner radius and top window shadow

  Safari desktop screenshots included the macOS window mask at the bottom and a shadow at the top. These artifacts caused incorrect detection of the viewable area for full page screenshots, which resulted in misaligned stitching. The viewable region is now calculated correctly by trimming these areas.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- 782b98a: # 🐛 Bugfixes

  ## #1000 fix incorrect cropping and stitching of last image for fullpage screenshots on mobile

  The determination of the position of the last image in mobile fullpage webscreenshots was incorrect. This was mostly seen with iOS, but also had some impact on Android. This is now fixed

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- 2c109b3: # 🐛 Bugfixes

  ## #1038 fix incorrect determination of ignore area

  Ignore regions with `left: 0` and `right:0` lead to an incorrect width which lead to an incorrect ignore area. This is now fixed

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.0.0

### Major Changes

- 1326e99: ## 💥 Major Release: New @wdio/image-comparison-core Package

  ### 🏗️ Architectural Refactor

  This release introduces a **completely new core architecture** with the dedicated `@wdio/image-comparison-core` package, replacing the generic `webdriver-image-comparison` module with a WDIO-specific solution.

  #### What was the problem?

  - The old `webdriver-image-comparison` package was designed for generic webdriver usage
  - Complex integration between generic and WDIO-specific code
  - Limited test coverage (~58%) making maintenance difficult
  - Mixed responsibilities between core logic and service integration

  #### What changed?

  ✅ **New dedicated core package**: `@wdio/image-comparison-core` - purpose-built for WebdriverIO
  ✅ **Cleaner architecture**: Modular design with clear separation of concerns
  ✅ **Enhanced test coverage**: Improved from ~58% to ~90% across all metrics
  ✅ **Better maintainability**: Organized codebase with comprehensive TypeScript interfaces
  ✅ **WDIO-specific dependencies**: Only depends on `@wdio/logger`, `@wdio/types`, etc.

  ### 🧪 Testing Improvements

  - **100% branch coverage** on critical decision points
  - **Comprehensive unit tests** for all major functions
  - **Optimized mocks** for complex scenarios
  - **Better test isolation** and reliability

  | Before/After       | % Stmts | % Branch | % Funcs | % Lines |
  | ------------------ | ------- | -------- | ------- | ------- |
  | **Previous**       | 58.59   | 91.4     | 80.71   | 58.59   |
  | **After refactor** | 90.55   | 96.38    | 93.99   | 90.55   |

  ### 🔧 Service Integration

  The `@wdio/visual-service` now imports from the new `@wdio/image-comparison-core` package while maintaining the same public API and functionality for users.

  ### 📈 Performance & Quality

  - **Modular architecture**: Easier to maintain and extend
  - **Type safety**: Comprehensive TypeScript coverage
  - **Clean exports**: Well-defined public API
  - **Internal interfaces**: Proper separation of concerns

  ### 🔄 Backward Compatibility

  ✅ **No breaking changes** for end users
  ✅ **Same public API** maintained
  ✅ **Existing configurations** continue to work
  ✅ **All existing functionality** preserved

  ### 🎯 Future Benefits

  This refactor sets the foundation for:

  - Easier addition of new features
  - Better bug fixing capabilities
  - Enhanced mobile and native app support
  - More reliable MultiRemote functionality

  ### 📦 Dependency Updates

  - Updated most dependencies to their latest versions
  - Improved security with latest package versions
  - Better compatibility with current WebdriverIO ecosystem
  - Enhanced performance through updated dependencies
  - Remove unused packages

  ***

  **Note**: This is an architectural improvement that modernizes the codebase while maintaining full backward compatibility. All existing functionality remains unchanged for users.

  ***

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
