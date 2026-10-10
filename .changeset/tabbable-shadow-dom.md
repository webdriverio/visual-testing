---
"@wdio/image-comparison-core": patch
---

fix: draw the real tab order in the tabbable commands, also through shadow DOM

`checkTabbablePage()`, `saveTabbablePage()` and `toMatchTabbablePageSnapshot()` now draw the tab stops in the order of the Tab key of the browser:

- the elements in open shadow roots, at the place of their host, and the elements in slots, in the order of the slots (#515);
- a positive `tabindex` in a shadow root is sorted only in that shadow root, a shadow host with a negative `tabindex` is skipped with its shadow root, and a host that delegates the focus is not a tab stop itself;
- elements with `position: fixed` are no longer left out;
- the summary of a closed `details` element is a tab stop and its content is not, and a `details` element without a summary is a tab stop;
- elements in an `inert` subtree or in a disabled `fieldset` are left out, and a radio group is per form, document or shadow root.

The content of closed shadow roots and of iframes can not be read from the page, so it is still not drawn.
