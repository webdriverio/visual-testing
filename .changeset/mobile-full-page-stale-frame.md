---
"@wdio/image-comparison-core": patch
---

fix: take a mobile full page screenshot again when it still shows the page from before the scroll

On a busy device, for example a new Android emulator or iOS simulator, the native screenshot after a scroll could still show the frame from before the scroll, even after the `fullPageScrollTimeout` wait. The full page image then had a part of the page two times, and a part was missing.

Now, when the page scrolled but its part of the screenshot has the same pixels as in the previous screenshot, the service waits (`fullPageScrollTimeout`, at least 500 ms) and takes the screenshot again, up to 3 times. When the content is still the same, for example on a page with two equal parts, it keeps the screenshot and logs a warning. This applies to the full page screenshots of iOS and of Android with native web screenshots.
