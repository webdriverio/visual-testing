---
"@wdio/image-comparison-core": patch
---

fix: draw the tab stops of editable content, image maps, scroll containers and dialogs as the browsers have them

`checkTabbablePage()`, `saveTabbablePage()` and `toMatchTabbablePageSnapshot()` now also follow the Tab key of the browser for these cases (checked with the real Tab key in Chrome, Edge, Firefox and Safari):

- an element with `contenteditable="plaintext-only"` (and the other editing hosts) is a tab stop; a link without a `tabindex` in editable content and an editable element in editable content are not;
- the areas (`<area href>`) of an image map that a rendered image uses are tab stops at the place of the map, drawn at the center of their shape on the image;
- a scroll container is a tab stop as the browser engine has it: in Chrome and Edge (130 and newer) when no tab stop is in it, in Firefox always, in Safari never;
- with a modal dialog only the top modal dialog can get the focus, and the drawing is in the top layer, above the dialog. In Firefox and Safari an open dialog is a tab stop itself;
- a page in design mode has only the `body` as tab stop in Chrome and Edge, and no tab stop in Firefox and Safari; an editable `html` or `body` is not a tab stop in Firefox;
- `audio` and `video` elements with controls are tab stops also in Safari, which gives them `tabIndex` -1.

Where browsers do not agree on other cases, the tab order of Chrome is used.
