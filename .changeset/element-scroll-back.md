---
"@wdio/image-comparison-core": patch
---

fix: scroll back to the old position after an element screenshot, also at the top of the page

With `autoElementScroll` (the default), `checkElement()`, `saveElement()` and `toMatchElementSnapshot()` scroll the element into view. When the page was at the top, they did not scroll back, because the position 0 was treated as "no position" (thanks to @theluckystrike for the first fix in #1271). A later viewport check then captured a scrolled page. The scroll back now works in the same way as for full page screenshots: the position is read before the page is prepared (so `removeElements` cannot change it) and restored after the page is restored, also when the screenshot fails. It is instant, also on a page with `scroll-behavior: smooth`. In Safari (macOS and iOS), the element and full page commands now wait until Safari keeps and shows the position (about 100 ms): before, a screenshot right after the command could still show the old position in Safari on macOS. Fixes #1229.
