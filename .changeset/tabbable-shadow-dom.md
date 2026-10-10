---
"@wdio/image-comparison-core": patch
---

fix: draw the real tab order in the tabbable commands, also through shadow DOM

`checkTabbablePage()`, `saveTabbablePage()` and `toMatchTabbablePageSnapshot()` now draw the tab stops in the order of the Tab key of the browser:

- the elements in open shadow roots, at the place of their host, and the elements in slots, in the order of the slots (#515);
- a positive `tabindex` in a shadow root is sorted only in that shadow root, a shadow host with a negative `tabindex` is skipped with its shadow root, and a host that delegates the focus is not a tab stop itself;
- elements with `position: fixed` are no longer left out;
- SVG links (also with `xlink:href`) and SVG and MathML elements with a `tabindex` are tab stops, also in shadow roots, and not when they are hidden;
- a `details` element is sorted like a shadow host: its summary is a tab stop and the content of a closed `details` element is not, a `details` element is a tab stop itself when it has no summary or has a `tabindex`, and a negative `tabindex` skips its summary and content;
- elements in an `inert` subtree (also an `inert` `body` or `html` element) or in a disabled `fieldset` are left out;
- a radio group has one tab stop: the checked radio input, or else the first radio input of the group in the tab order. The group uses the form owner (also with the `form` attribute), the name, and the document or shadow root of the radio input. Where browsers do not agree, the order of Chrome is used.

The content of closed shadow roots and of iframes can not be read from the page, so it is still not drawn.
