---
"@wdio/image-comparison-core": patch
---

fix: scroll back to the old position after a full page screenshot

When the full page screenshot is made by scrolling and joining viewport screenshots (WebDriver Classic, and Android and iOS mobile web), `checkFullPageScreen()`, `saveFullPageScreen()`, `toMatchFullPageSnapshot()` and the tabbable commands left the page at the bottom. A later viewport check then captured a scrolled page. The page is now scrolled back to the position that it had before the command. The position is read before the page is prepared (so `removeElements` cannot change it) and restored after the page is restored, also when the screenshot fails. Fixes #1231.
