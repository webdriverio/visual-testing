---
"@wdio/visual-service": major
"@wdio/image-comparison-core": major
"@wdio/ocr-service": major
---

feat!: support WebdriverIO v10 only

All changes that users can notice in v11, also the fixes in `@wdio/image-comparison-core` 3.0.0, are in the [v11 migration guide](https://github.com/webdriverio/visual-testing/blob/main/docs/v11-migration.md).

`@wdio/visual-service` v11, `@wdio/image-comparison-core` v3 and `@wdio/ocr-service` v3 support only WebdriverIO v10. WebdriverIO v10 needs Node.js 22.19 or later.

**What changed**

- The `@wdio/globals`, `@wdio/logger` and `@wdio/types` dependencies are now `^10.0.0` (before: `^9.29.1 || ^10.0.0`).
- The code paths for WebdriverIO v9 are removed. For example, a multiremote browser or element is found only with the `isMultiRemote` flag of WebdriverIO v10, not with the `isMultiremote` flag of WebdriverIO v9.
- The visual service finds the browser of an element, and a multiremote element, with the kind brand of WebdriverIO v10 (`Symbol.for('wdio.kind')`). `toMatchElementSnapshot()` gives a clear error for a value that is not a WebdriverIO v10 element.

**If you use WebdriverIO v9**

Stay on `@wdio/visual-service@10`, `@wdio/image-comparison-core@2` and `@wdio/ocr-service@2`. They are in maintenance on the `v10` branch, and fixes are backported on request.
