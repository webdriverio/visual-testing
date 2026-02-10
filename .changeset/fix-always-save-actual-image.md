---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

## #1115 Respect `alwaysSaveActualImage: false` for `checkScreen` methods

When using visual matchers like `toMatchScreenSnapshot('tag', 0.9)` with `alwaysSaveActualImage: false`, the actual image was still being saved even when the comparison passed within the threshold.

The root cause was that the matcher's expected threshold was not being passed to the core comparison logic. The core used `saveAboveTolerance` (defaulting to 0) to decide whether to save images, while the matcher used the user-provided threshold to determine pass/fail - these were disconnected.

This fix ensures:
- When `alwaysSaveActualImage: false` and `saveAboveTolerance` is not explicitly set, actual images are never saved (respecting the literal meaning of the option)
- When `saveAboveTolerance` is explicitly set (like matchers do internally), actual images are saved only when the mismatch exceeds that threshold

# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
