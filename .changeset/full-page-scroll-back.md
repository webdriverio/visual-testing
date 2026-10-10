---
"@wdio/image-comparison-core": patch
---

fix: scroll back to the old position after a full page screenshot

When the full page screenshot is made by scrolling and joining viewport screenshots (WebDriver Classic, and Android and iOS mobile web), `checkFullPageScreen()`, `saveFullPageScreen()` and `toMatchFullPageSnapshot()` left the page at the bottom. A later viewport check then captured a scrolled page. They now scroll back to the position that the page had before. Full page screenshots in a WebDriver BiDi session do not scroll and do not change. Fixes #1231.
