# Migrating to v11

v11 is in prerelease on `main` (npm tag `next`). This guide lists what changes when you move from

- `@wdio/visual-service` v10 to v11,
- `@wdio/image-comparison-core` v2 to v3,
- `@wdio/ocr-service` v2 to v3,
- `@wdio/visual-reporter` 0.4 to 0.5.

> Contributors: when a PR changes something that users of these packages can notice, update this guide in the
> same PR. At the v11 release, this content also goes to the WebdriverIO documentation
> ([visual testing FAQ](https://webdriver.io/docs/visual-testing/faq)).

## Summary

| Change | Do you need to do something? |
|---|---|
| [WebdriverIO v10 only](#webdriverio-v10-only) | Yes, if you still use WebdriverIO v9 |
| [Node.js 22.19 or later](#nodejs-2219-or-later) | Only on an older Node.js |
| [New color difference metric (pixelmatch 8)](#new-color-difference-metric-pixelmatch-8) | Check tight tolerances; maybe re-accept some baselines |
| [Ignored regions](#ignored-regions) | Only if a check fails after the upgrade |
| [OCR: tesseract.js 7](#ocr-tesseractjs-7) | No |
| [Visual reporter](#visual-reporter) | No |
| [Smaller fixes](#smaller-fixes) | No |

## WebdriverIO v10 only

`@wdio/visual-service` v11, `@wdio/image-comparison-core` v3 and `@wdio/ocr-service` v3 support only
WebdriverIO v10. The code paths for WebdriverIO v9 are removed.

- The packages declare `webdriverio: ^10.0.0` as a peer dependency. A WebdriverIO project always has it
  installed.
- A multi-remote browser or element is found with the `isMultiRemote` flag of WebdriverIO v10 (not
  `isMultiremote` of v9), and an element with the kind brand of WebdriverIO v10.
  `toMatchElementSnapshot()` gives a clear error for a value that is not a WebdriverIO v10 element.

**If you still use WebdriverIO v9:** stay on `@wdio/visual-service@10`, `@wdio/image-comparison-core@2` and
`@wdio/ocr-service@2`. They are in maintenance on the `v10` branch, and fixes are backported on request.

For the WebdriverIO v10 changes that affect visual tests (strict `$()`, elements in a frame), see
[Upgrading to WebdriverIO v10](../README.md#upgrading-to-webdriverio-v10).

## Node.js 22.19 or later

All packages declare `"engines": { "node": ">=22.19.0" }`, like WebdriverIO 10. For the visual, OCR and
comparison packages this changes nothing, because WebdriverIO 10 already needs it.
`@wdio/visual-reporter` declared `>=20.0.0` before.

## New color difference metric (pixelmatch 8)

The comparison engine is now [pixelmatch 8](https://github.com/mapbox/pixelmatch). It measures color
differences in the OKLab color space with the HyAB distance instead of YIQ. This is closer to how people
see colors: fewer false positives and fewer missed changes.

- The API and the `threshold` scale (`0` to `1`, where `1` is black vs white) did not change, so the
  `ignore*` options keep their values.
- **Mismatch percentages can differ a little** for the same images. On real screenshots the number of
  different pixels changed by about −3 % to +3 %. Example: a full page with a 1-pixel shift and
  `ignoreAntialiasing` went from 0.002 % to 0.003 %.

**What to do:** run your visual tests once after the upgrade. If a check fails only because it uses an exact
mismatch percentage or a very tight tolerance, check the image and re-accept the baseline
(`--update-visual-baseline`), or adjust the tolerance.

## Ignored regions

Ignored regions (`ignore` elements, `blockOut` rectangles and the `blockOut*` bars) are now skipped by
pixelmatch with a mask. Before, they were painted black in both images before the comparison. The baseline,
actual and diff files do not change, and the diff image still shows the ignored regions in green. You can notice
2 effects:

- **The edge of a region with `ignoreAntialiasing`:** the pixels next to a region are now compared with their
  real neighbours, so the anti-aliasing detection there can give a slightly different count (on a real
  screenshot: 15 more pixels out of 61 208).
- **A region that goes past the right edge of the image** (for example an element that is partly outside the
  viewport, or a `blockOut` rectangle that is too wide) is now cut at the edge. Before, the part outside the image
  continued on the left side of the next pixel rows, so those pixels were also ignored by mistake. A real change
  there was not found before, and is found now.

**What to do:** nothing, unless a check fails after the upgrade. Then look at the diff image: a difference at the
left edge of the image, below an ignored region, is a real difference that v10 did not report.

## OCR: tesseract.js 7

`@wdio/ocr-service` uses tesseract.js 7 (before: 5) when no system Tesseract is installed.

- About 15 % faster, and the memory leak of tesseract.js 5 (memory grew over time until a crash) is fixed.
- On our test screenshots, the found text and word positions are the same.
- The `clickDuration` option of `ocrClickOnText` is typed `number` (before: the wrapper type `Number`).

No change is needed.

## Visual reporter

`@wdio/visual-reporter` 0.5:

- Needs Node.js 22.19 or later (before: 20).
- The report UI is rebuilt with React Router (before: Remix 2), React 19 and Vite 8. It looks and works the
  same.
- **Browser support of the report did not change:** Chrome 87+, Edge 88+, Firefox 78+, Safari 14+, the same
  browsers as Vite 5 built for. Vite 8 has a newer default target, so the reporter sets this list itself.
- The CLI wizards use `@inquirer/prompts` 8 and `ora` 9; they work the same.
- **The report works in any folder of a static host,** for example an AWS S3 bucket, also when the URL ends with
  `index.html` or has a query string. Before, it only worked at the root of a web server, opened as a folder (`/`).

## Smaller fixes

You do not need to change anything for these, but you can notice them:

- **Background tabs (WebDriver BiDi, Chromium):** before a check or save command, a page in a background tab
  is brought to the front, as ChromeDriver does for WebDriver Classic screenshots. Before, such a check could
  save a new baseline with another file name, or hang until `bidiResponseTimeout`. In these sessions each check
  or save command first runs one small script to read `document.visibilityState`, and in a headed browser you can
  see the tab come to the front.
- **Types:** the published type declarations of `@wdio/image-comparison-core` resolve in your project. Before,
  some types (for example `TestContext`, `CompareData`, `ElementIgnore`) became `any`.
- **`mobileEmulation.deviceName`:** `browser.emulate('device')` is called only for a device that WebdriverIO
  knows; for other names, the viewport of the emulated device is used without a failed call first.
- **`ignore` elements:** an element is found again only when its reference is stale, not for every check.
- **Matcher messages:** the documentation link in the message of a failed visual matcher works again.
- **iOS, first Safari start:** on a new simulator or device (for example in CI), iOS 26 shows a Safari tip that
  took the tap the service uses to measure the viewport. Full page screenshots of that session then failed with
  "Negative scroll position detected". The service now measures again when the tap did not reach the page, as it
  already did on Android.
- **Full page screenshots scroll back:** after a full page or tabbable check or save, the page is now scrolled back
  to the position that it had before the command. Before, a full page screenshot that scrolls (WebDriver Classic, and
  Android and iOS mobile web) left the page at the bottom, the tabbable commands also left it at the top, and a later
  viewport check captured a scrolled page. If a test makes a viewport check right after one of these commands, its
  baseline can change once.
- **Element screenshots scroll back:** with `autoElementScroll` (the default), an element check or save now always
  scrolls the page back to the position that it had before the command. Before, a page at the top stayed at the
  element, a page with `removeElements` could go back to a wrong position, and a failed element screenshot left the
  page at the element. If a test makes a viewport check right after an element check, its baseline can change once.
- **Element screenshots with `biDiOrigin: 'viewport'`:** in a WebDriver BiDi session, the element screenshot now cuts
  the element itself. Before, when the page was scrolled (also by `autoElementScroll`), it failed with "The element is
  not in the viewport", or it showed another part of the page without an error. Baselines made with this option on a
  scrolled page can change once.
- **Safari desktop full page screenshots on a Retina screen:** with a device pixel ratio above 1 (for example a Mac
  with a Retina screen), most parts of the image were outside of it, and the image had black areas and repeated parts.
  Baselines made like that change once. With a device pixel ratio of 1 the image does not change.
- **Tabbable commands follow the real tab order:** `checkTabbablePage()` and `saveTabbablePage()` now also draw the
  elements in open shadow roots (in the order of their slots), elements with `position: fixed`, SVG links with
  `xlink:href`, the summary of a closed `details` element and a `details` element with a `tabindex`. They leave out
  `inert` elements, elements in a disabled `fieldset`, the content of a closed `details` element, and all radio inputs
  of a group except its tab stop. Tabbable baselines of such pages change once.
- **iOS element screenshots of large elements:** for an element that is not fully inside the viewport, the image
  had the size of the whole element, but only the visible part had content and the rest was black (an Appium bug,
  [appium/appium#22939](https://github.com/appium/appium/issues/22939)). The image now has only the visible part of
  the element, as on Android, so baselines of such elements change once.
