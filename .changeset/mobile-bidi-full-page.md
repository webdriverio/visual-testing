---
"@wdio/image-comparison-core": patch
---

fix: use scroll and stitch for a full page screenshot in a mobile browser in a WebDriver BiDi session

The full page commands used the BiDi document screenshot also on mobile browsers. Chrome on Android gives an image of the right height that repeats the viewport, so `checkFullPageScreen()`, `saveFullPageScreen()` and `toMatchFullPageSnapshot()` showed the wrong page, and a comparison with a baseline of the same type passed. The screen and element commands already do not use BiDi screenshots on mobile. Baselines that were saved with this wrong image must be saved again.
