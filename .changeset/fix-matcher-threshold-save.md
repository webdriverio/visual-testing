---
"@wdio/visual-service": patch
---

# 🐛 Bugfixes

## #1111 Pass matcher threshold to core as saveAboveTolerance

When using visual matchers like `toMatchScreenSnapshot('tag', 0.9)` with `alwaysSaveActualImage: false`, the actual image was still being saved even when the comparison passed within the threshold.

The root cause was that the matcher's expected threshold was not being passed to the core comparison logic. The core used `saveAboveTolerance` (defaulting to 0) to decide whether to save images, while the matcher used the user-provided threshold to determine pass/fail - these were disconnected.

This fix ensures the matcher passes the expected threshold to the core as `saveAboveTolerance`, so images are only saved when the mismatch actually exceeds the user's acceptable threshold.
