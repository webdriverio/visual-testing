---
"@wdio/ocr-service": patch
---

fix: type `clickDuration` as `number` instead of the wrapper object type `Number`

The `clickDuration` option of `ocrClickOnText` used the type `Number`. It now uses `number`, like the other numeric options.
