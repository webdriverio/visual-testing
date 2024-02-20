---
"webdriver-image-comparison": minor
"@wdio/visual-service": minor
---

Add font loading features:
- add `waitForFontsLoaded` so the module automatically waits for all fonts to be loaded, enabled by default
- add `enableLayoutTesting` so all text will become transparent so
  - font rendering issues won't cause flakiness
  - image comparison can be done on layout
