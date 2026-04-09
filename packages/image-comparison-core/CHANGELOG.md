# @wdio/image-comparison-core

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
