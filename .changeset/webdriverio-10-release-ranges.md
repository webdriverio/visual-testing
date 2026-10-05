---
"@wdio/visual-service": patch
"@wdio/ocr-service": patch
"@wdio/image-comparison-core": patch
---

chore: accept the WebdriverIO 10 releases instead of the 10.0.0 prereleases

The `@wdio/globals`, `@wdio/logger` and `@wdio/types` ranges change from `^9.29.1 || ^10.0.0-0` to `^9.29.1 || ^10.0.0`. WebdriverIO 10.0.0 is released, so the alpha versions are no longer accepted. WebdriverIO v9 (9.29.1 and later) is still supported.
