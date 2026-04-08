---
"@wdio/image-comparison-core": patch
"@wdio/ocr-service": patch
"@wdio/visual-reporter": patch
"@wdio/visual-service": patch
---

#### `@wdio/image-comparison-core` and `@wdio/ocr-service` — Security: update jimp (CVE in `file-type` transitive dep)

Bumped `jimp` to the latest version to resolve a reported vulnerability in its `file-type` transitive dependency (see [#1130](https://github.com/webdriverio/visual-testing/issues/1130), raised by [@denis-sokolov](https://github.com/denis-sokolov), thank you!).

**Actual impact on these packages**
`file-type` is used by `@jimp/core` solely to detect image MIME types when reading a buffer. In both `@wdio/image-comparison-core` and `@wdio/ocr-service`, every image passed to jimp originates from either WebDriver screenshots (browser-controlled base64 data) or local files written by the framework itself. There is no code path where untrusted external input is fed directly into jimp, which removes the exploitability that the CVE describes.

That said, the reputational and compliance risk was real, security scanners flag the package as vulnerable, enterprise users hit audit failures, and some organisations block installation of packages with known CVEs. The update addresses all of that.

#### `@wdio/visual-reporter` and `@wdio/visual-service`

Updated internal dependencies to pick up the jimp bump in `@wdio/image-comparison-core`.


### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
