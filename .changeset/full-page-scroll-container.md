---
"@wdio/image-comparison-core": minor
"@wdio/visual-service": minor
---

feat: full page screenshots of apps where a container scrolls, with the new `scrollContainer` option

In many apps the page itself does not scroll, a container does (for example a `main` element under a fixed header). A full page screenshot of such an app was only the viewport (WebDriver BiDi), or the top of the page again and again (scroll and stitch). The new `scrollContainer` option of `checkFullPageScreen()`, `saveFullPageScreen()` and `toMatchFullPageSnapshot()` gives the element that scrolls. The image is then the viewport with this container expanded: the part above the container, the full content of the container, and the part below it. The screenshot scrolls and stitches (also in a WebDriver BiDi session) and scrolls the container back to its start position. The ignore elements are measured at each screenshot, so an element is ignored at each place where it is in the image (for example a sticky title in each screenshot). The container must be fully in the viewport: a container that goes above or below the viewport gives an error, because its first or last rows can not be in the image. Fixes #125.
