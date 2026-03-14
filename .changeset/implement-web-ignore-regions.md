---
'@wdio/image-comparison-core': minor
'@wdio/visual-service': minor
---

## #857 Support ignore regions for web screenshots

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
