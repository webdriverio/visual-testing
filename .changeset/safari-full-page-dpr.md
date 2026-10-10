---
"@wdio/image-comparison-core": patch
---

fix: full page screenshots in Safari desktop on a screen with a device pixel ratio above 1

In Safari desktop (WebDriver Classic), each part of a full page screenshot is put right after the previous one. The position of the previous part was already in device pixels and was converted again, so on a Retina screen (device pixel ratio 2) the positions doubled with each part: most parts were outside the image, and the image had black areas and repeated parts. The position is now counted in CSS pixels. With a device pixel ratio of 1 the image does not change.
