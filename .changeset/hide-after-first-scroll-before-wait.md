---
"@wdio/image-comparison-core": patch
---

fix: hide the `hideAfterFirstScroll` elements before the scroll wait of a full page screenshot

The elements of `hideAfterFirstScroll` were hidden after the `fullPageScrollTimeout` wait, just before the screenshot. On a slow device or emulator, the page was not drawn again in time, so the screenshot could still show them (for example a sticky header in the second part of the full page image). They are now hidden before the wait, so the page has the whole wait to be drawn again. This applies to desktop, Android and iOS full page screenshots.
