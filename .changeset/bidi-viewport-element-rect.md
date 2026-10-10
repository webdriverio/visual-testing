---
"@wdio/image-comparison-core": patch
---

fix: clip the right area for element screenshots with `biDiOrigin: 'viewport'`

With `biDiOrigin: 'viewport'`, an element screenshot in a WebDriver BiDi session used the position of the element on the page (`getElementRect`) as its position in the viewport. When the page was scrolled, for example by `autoElementScroll`, the screenshot either failed with "The element is not in the viewport" (an element below the first viewport) or, without an error, showed another part of the page. The clip now uses the position of the element in the viewport.
