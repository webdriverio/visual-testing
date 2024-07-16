# @wdio/ocr-service

## 1.0.3

### Patch Changes

- 26c1a17: This release contains better support for Multiremote tests on the instances and global level, including better Native App support. This is related to issue https://github.com/webdriverio/visual-testing/issues/418 which is fixed by this release

  # 💅 Polish

  - cab1219: Update dependencies
  - 2583542 / 8b1f837: add new tests
  - eec29e1 / e2b2d38: update images

  # 🐛 Bug Fixes

  - 29f6f82 / 1ba9817: fix issue https://github.com/webdriverio/visual-testing/issues/418

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.0.2

### Patch Changes

- 6e1e478: Fix contrast and languages

## 1.0.1

### Patch Changes

- 083ad82: Fixed OCR cli

## 1.0.0

### Major Changes

- a924dfc: # 🚀 New Feature

  Sometimes it can be hard to find an element in a mobile native app or desktop site, with an interactable Canvas, with the default [WebdriverIO selectors](https://webdriver.io/docs/selectors). In that case, it would be nice if you would be able to use something like OCR ([Optical Character Recognition](https://en.wikipedia.org/wiki/Optical_character_recognition)) to interact with elements on your device/screen.

  The new `@wdio/ocr-service` service provides you with the option to interact with elements based on **visible text**. It will provide multiple commands to:

  - wait
  - search
  - and interact

  with an element, all based on text.

  The following commands will be added

  - `ocrGetText`
  - `ocrGetElementPositionByText`
  - `ocrWaitForTextDisplayed`
  - `ocrClickOnText`
  - `ocrSetValue`

    A CLI command will also be provided to pre-check text received from the image, this can be run by using the command `npx ocr-service`. For a demo check this video

    https://github.com/webdriverio/visual-testing/assets/11979740/af001bd8-3068-43f5-8b44-b320174883a8
