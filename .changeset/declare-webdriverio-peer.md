---
"@wdio/visual-service": patch
"@wdio/ocr-service": patch
---

Declare `webdriverio` as a peer dependency. Both packages import it at runtime, but did not list it.
