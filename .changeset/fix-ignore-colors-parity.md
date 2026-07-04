---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

fix: align ignoreColors with resemble brightness comparison

In v10, `ignoreColors` grayscaled images with BT.601 weights before pixelmatch, which does not match resemble.js brightness-only comparison (`0.3/0.59/0.11` luma).

**What changed**

- Grayscale preprocessing now uses resemble luma coefficients via `applyResembleGrayscale`
- Added unit and integration tests for same-brightness pass and brightness-diff fail cases

**Migration**

- No action needed unless you rely on `ignoreColors` tolerating hue shifts; results may differ slightly from v10 but align with resemble v9

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
