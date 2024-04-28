---
"@wdio/visual-service": major
---

# 🚀 New Feature

Sometimes it can be hard to find an element in a mobile native app or desktop site with an interactable Canvas with the default [WebdriverIO selectors](https://webdriver.io/docs/selectors). In that case, it would be nice if you would be able to use something like OCR ([Optical Character Recognition](https://en.wikipedia.org/wiki/Optical_character_recognition)) to interact with elements on your device/screen.

This new feature provides you with **that** option to interact with elements based on **visible text**. It will provide multiple commands to:

-   wait
-   search
-   and interact

with an element, all based on text.

The following commands will be added

-   `ocrGetText`
-   `ocrGetElementPositionByText`
-   `ocrWaitForTextDisplayed`
-   `ocrClickOnText`
-   `ocrSetValue`

A CLI command will also be provided to pre-check text received from the image. For a demo check this video

https://github.com/webdriverio/visual-testing/assets/11979740/6e4677ba-1463-4d6e-98b0-9a3bf70b702f

# 🐛 Bug Fixes

-   Fixes https://github.com/webdriverio/visual-testing/issues/286
