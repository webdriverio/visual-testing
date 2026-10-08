---
"@wdio/visual-service": patch
---

fix: bring a page in a background tab to the front before a check or save command (WebDriver BiDi, Chromium)

In a WebDriver BiDi session with a Chromium-based browser (Chrome, Chromium, Edge) on Linux, a page in a background tab, for example after `browser.newWindow()` (which in WebdriverIO v10 does not switch to the new tab), caused 2 problems:

- The page reports another window size, which changes the image file name. With `autoSaveBaseline`, the check then saved a new baseline and returned 0 without comparing.
- When the page had no new frame for about 300 ms, the screenshot never returned, until the `bidiResponseTimeout` (180 seconds by default). This is a Chromium bug, which also happens with the Chrome DevTools Protocol only: https://issues.chromium.org/issues/571157133

Before each check or save command, the visual service now brings that page to the front with `browsingContext.activate`, as ChromeDriver already does for a WebDriver Classic screenshot. It does this only in BiDi sessions of Chromium-based desktop browsers, and only when the page is hidden. Firefox, Safari, mobile and WebDriver Classic sessions do not change. A failed activation only logs a warning.
