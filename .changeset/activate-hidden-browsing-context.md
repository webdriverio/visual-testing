---
"@wdio/visual-service": patch
---

fix: activate a page in a background tab before a check or save command (WebDriver BiDi)

In a WebDriver BiDi session, a page in a background tab, for example after `browser.newWindow()` (which in WebdriverIO v10 does not switch to the new tab), caused 2 problems:

- The page reports another window size, which changes the image file name. With `autoSaveBaseline`, the check then saved a new baseline and returned 0 without comparing.
- The screenshot could hang until the `bidiResponseTimeout` (180 seconds by default).

Before each check or save command, the visual service now activates the browsing context of the browser when its page is hidden (`document.visibilityState` is `hidden`), as a WebDriver Classic screenshot does. The tab of the page then comes to the front. Mobile and WebDriver Classic sessions do not change.
