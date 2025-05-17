---
"webdriver-image-comparison": patch
"@wdio/visual-service": patch
---

## 🐛 Bug-fixes

- #946: Visual Regression Changes in WDIO v9
  - Fixed screen size detection in emulated mode for filenames. Previously used incorrect browser window size.
  - Fixed screenshot behavior when `enableLegacyScreenshotMethod: true`, now correctly captures emulated screen instead of complete screen.
  - Fixed emulated device handling for Chrome and Edge browsers, now properly sets device metrics based on `deviceMetrics` or `deviceName` capabilities.

## Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

