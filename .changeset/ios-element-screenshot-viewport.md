---
"@wdio/image-comparison-core": patch
---

fix: no transparent (black) area in iOS element screenshots of elements larger than the viewport

In iOS Safari, the Appium element screenshot of an element that is not fully inside the viewport has the size of the whole element, but only the visible part has pixels; the rest is transparent and shows as black (#1127, https://github.com/appium/appium/issues/22939). Until Appium fixes it, the service cuts the visible part of such an element from a screenshot, as it already does on Android. Elements that are fully inside the viewport do not change.
