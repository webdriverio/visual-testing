---
"@wdio/image-comparison-core": minor
"@wdio/visual-service": minor
---

feat: full page screenshots of apps where a container scrolls, with the new `scrollContainer` option

In many apps the page itself does not scroll, a container does (for example a `main` element under a fixed header). A full page screenshot of such an app was only the viewport (WebDriver BiDi), or the top of the page again and again (scroll and stitch). The new `scrollContainer` option of `checkFullPageScreen()`, `saveFullPageScreen()` and `toMatchFullPageSnapshot()` gives the element that scrolls. The image is then the viewport with this container expanded: the part above the container, the full content of the container, and the part below it. The screenshot scrolls and stitches (also in a WebDriver BiDi session), maps the ignore regions to this image, and scrolls the container back to its start position. Fixes #125.
