---
"@wdio/image-comparison-core": patch
---

fix: scroll back to the old position after a full page screenshot

When the full page screenshot is made by scrolling and joining viewport screenshots (WebDriver Classic, and Android and iOS mobile web), `checkFullPageScreen()`, `saveFullPageScreen()` and `toMatchFullPageSnapshot()` left the page at the bottom, and the tabbable commands left it at the top or at the bottom. A later viewport check then captured a scrolled page. The page is now scrolled back to the position that it had before the command. The position is read before the page is prepared (so `removeElements` cannot change it) and restored after the page is restored, also when the screenshot fails. The scroll back is instant, also on a page with `scroll-behavior: smooth`. On iOS, Safari can put back the old position for a moment after the page is restored, so the command waits until the page stays at the position (about 150 ms). Fixes #1231.
