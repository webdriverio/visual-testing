---
"@wdio/visual-service": patch
"@wdio/ocr-service": patch
"@wdio/image-comparison-core": patch
---

fix: declare `webdriverio` as a peer dependency

`@wdio/visual-service` and `@wdio/ocr-service` import `webdriverio` at runtime, and the types of `@wdio/image-comparison-core` use the `webdriverio` types, but the packages did not declare it. They now have the peer dependency `webdriverio: ^10.0.0`. A WebdriverIO project always has `webdriverio` installed, so no change is needed in your project.
