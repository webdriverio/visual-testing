---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
"@wdio/ocr-service": patch
"@wdio/visual-reporter": minor
---

chore: declare Node.js `>=22.19.0`, the same as WebdriverIO 10

All packages now declare `"engines": { "node": ">=22.19.0" }`, like every package of WebdriverIO 10.

- `@wdio/image-comparison-core`, `@wdio/visual-service` and `@wdio/ocr-service` did not declare a Node.js version, but they already needed 22.19 or newer through WebdriverIO 10.
- `@wdio/visual-reporter` declared `>=20.0.0`. Node.js 20 is end-of-life, and the reporter CLI is used together with WebdriverIO 10, so it now also needs Node.js 22.19 or newer.
