---
"webdriver-image-comparison": patch
"@wdio/visual-service": patch
---

## 🐛 Bug-fixes

### #967: Emulated device crops with `enableLegacyScreenshotMethod` set to `true` are not correct

When a screenshot of an emulated device is taken, but the browser was initially started as a "desktop" session, so not with emulated caps, and the `enableLegacyScreenshotMethod` property is set to `true`, the DPR of the emulated device is taken. This resulted in incorrect crop. We now store the original dpr and use that for the crop when it's an emulated device and started as a desktop browser session.

## BiDi Fullpage screenshots for emulated device are broken

The BiDi fullpage screenshot for an emulated device is broken in the driver. We now fallback to the legacy screenshot method for BiDi and emulated devices

## 💅 Polish

- Updated the multiple interfaces to use JS-Doc for better docs
- When `createJsonReportFiles` is set to `true` and there are a lot of differences we kept waiting. We now limited that to check a max of 5M diff-pixels or a diff threshold of 20%. If it's bigger the report will show a full coverage and extra logs are shown in the WDIO logs, something like this

```logs
[0-0] 2025-05-24T06:02:18.887Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Processing diff pixels started
[0-0] 2025-05-24T06:02:18.888Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Processing 20143900 diff pixels
[0-0] 2025-05-24T06:02:19.770Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Total pixels in image: 52,184,160
[0-0] 2025-05-24T06:02:19.770Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Number of diff pixels: 20,143,900
[0-0] 2025-05-24T06:02:19.770Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Diff percentage: 38.60%
[0-0] 2025-05-24T06:02:19.770Z ERROR @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Too many differences detected! Diff percentage: 38.60%, Diff pixels: 20,143,900
[0-0] 2025-05-24T06:02:19.771Z ERROR @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: This likely indicates a major visual difference or an issue with the comparison.
[0-0] 2025-05-24T06:02:19.771Z ERROR @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Consider checking if the baseline image is correct or if there are major UI changes.
```

## Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
