---
"@wdio/image-comparison-core": patch
---

fix: scroll back to position 0 after an element screenshot

With `autoElementScroll` enabled, `checkElement`, `saveElement` and `toMatchElementSnapshot` scroll the element into view and then scroll back to the old position. When the old position was 0 (the top of the page), the page was not scrolled back, because 0 was treated as "no position". A later `checkScreen` then captured a scrolled page. The position is now restored whenever it was read, also when it is 0.
