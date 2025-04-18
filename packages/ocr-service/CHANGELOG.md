# @wdio/ocr-service

## 2.2.6

### Patch Changes

- 42956e4: ## 💥 BREAKING CHANGES

  ### 🔍 Viewport Screenshot Logic Reworked for Mobile Web & Hybrid Apps

  #### What was the problem?

  Screenshots for mobile devices were inconsistent due to platform differences. iOS captures the entire device screen (including status and address bars), while Android (using ChromeDriver) only captures the webview, unless the capability `"appium:nativeWebScreenshot": true` is used.

  #### What changed?

  We’ve reimplemented the logic to correctly handle both platforms by default.
  This fix addresses [[#747](https://github.com/webdriverio/visual-testing/pull/747)](https://github.com/webdriverio/visual-testing/pull/747).

  💡 Credit to [Benjamin Karran (@ebekebe)](https://github.com/ebekebe) for pointing us in the right direction to improve this logic!

  #### What’s the advantage?

  ✅ More **accurate full-page and element screenshots** on both Android and iOS.
  ⚠️ But this change may **break your current baselines**, especially on Android and iOS.

  ***

  ### 🍏 iOS Element Screenshot Strategy Changed

  #### What was the problem?

  iOS element screenshots were previously cut from full-device screenshots, which could lead to misalignment or off-by-a-few-pixels issues.

  #### What changed?

  We now use the element screenshot endpoint directly.

  #### What’s the advantage?

  ✅ More accurate iOS element screenshots.
  ⚠️ But again, this may affect your existing baselines.

  ***

  ### 🖥️ New Full-Page Screenshot Strategy for **Desktop Web**

  #### What was the problem?

  The "previous" scroll-and-stitch method simulated user interaction by scrolling the page, waiting, taking a screenshot, and repeating until the entire page was captured.
  This works well for **lazy-loaded content**, but it is **slow and unstable** on other pages.

  #### What changed?

  We now use WebDriver BiDi’s [`[browsingContext.captureScreenshot](https://webdriver.io/docs/api/webdriverBidi#browsingcontextcapturescreenshot)`] to capture **full-page screenshots in one go**. This is the new **default strategy for desktop web browsers**.

  📌 **Mobile platforms (iOS/Android)** still use the scroll-and-stitch approach for now.

  #### What’s the advantage?

  ✅ Execution time reduced by **50%+**
  ✅ Logic is greatly simplified
  ✅ More consistent and stable results on static or non-lazy pages
  📸 ![Example](https://github.com/user-attachments/assets/394ad1d6-bbc7-42dd-b93b-ff7eb5a80429)

  **Still want the old scroll-and-stitch behavior or need fullpage screenshots for pages who have lazy-loading?**

  Use the `userBasedFullPageScreenshot` option to simulate user-like scrolling. This remains the **better choice for pages with lazy-loading**:

  ```ts
  // wdio.conf.ts
  services: [
    [
      "visual",
      {
        userBasedFullPageScreenshot: true,
      },
    ],
  ];
  ```

  Or per test:

  ```ts
  await expect(browser).toMatchFullPageSnapshot("homepage", {
    userBasedFullPageScreenshot: true,
  });
  ```

  ***

  ## 💅 Polish

  ### ⚠️ Deprecated Root-Level Compare Options

  #### What was the problem?

  Compare options were allowed at the root level of the service config, making them harder to group or discover.

  #### What changed?

  You now get a warning if you still use root-level keys. Please move them under the `compareOptions` property instead.

  **Example warning:**

  ```log
  WARN The following root-level compare options are deprecated and should be moved under 'compareOptions':
    - blockOutStatusBar
    - ignoreColors
  In the next major version, these options will be removed from the root level.
  ```

  📘 See: [[compareOptions docs](https://webdriver.io/docs/visual-testing/service-options#compare-options)](https://webdriver.io/docs/visual-testing/service-options#compare-options)

  ***

  ## 🐛 Bug Fixes

  - ✅ [[#747](https://github.com/your-repo/issues/747)](https://github.com/your-repo/issues/747): Fixed incorrect mobile webview context data.

  ***

  ## 🔧 Other

  - 🆙 Updated dependencies
  - 🧪 Improved test coverage
  - 📸 Refreshed image baselines

  ***

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 2.2.5

### Patch Changes

- 09dbc2d: update deps

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 2.2.4

### Patch Changes

- 69d25fe: Multiple fixes:

  - update deps

## 2.2.3

### Patch Changes

- 2d033e8: update deps

## 2.2.2

### Patch Changes

- 4a4adf1: update deps

## 2.2.1

### Patch Changes

- a34dd5d: Update of deps

## 2.2.0

### Minor Changes

- 786248e: Upgrade Jimp to the latest major

## 2.1.1

### Patch Changes

# d76044f 🐛 Fix ERR_BUFFER_OUT_OF_BOUNDS for multiremote

Functions in utils such as `getData.ts` used the global `browser`, but this is not browser is not the browser making for example the `ocrClick` function call when the we are running in the multiremote context. This could lead to `ERR_BUFFER_OUT_OF_BOUNDS` error. This release fixes that error.

# Committers: 1

- Chanatan Charnkijtawarush ([@ccharnkij](https://github.com/ccharnkij))

## 2.1.0

### Minor Changes

- f5f8041: fix click duration for 0ms

### Committers: 1

- Fabien CELLIER ([@lacell75](https://github.com/lacell75))

## 2.0.0

### Major Changes

- 9fdb2d2: feat: work with V9

## 1.0.5

### Patch Changes

- 85a1d82: # 🐛 Bug Fixes

  Fix issues:

  - [438](https://github.com/webdriverio/visual-testing/issues/438): resizeDimensions not working
  - [448](https://github.com/webdriverio/visual-testing/issues/448): hideElements and removeElements` don't work for native apps

  # 💅 Polish

  - update dependencies

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.0.4

### Patch Changes

- 0b01b64: ### @wdio/visual-service

  #### 🚀 New Features

  **Added Reporting output**
  You now have the option to export the compare results into a JSON report file. By enabling the module option `createJsonReportFiles: true`, each image that is compared will create a report stored in the `actual` folder, next to each `actual` image result.

  The output will look like this:

  ```json
  {
    "parent": "check methods",
    "test": "should fail comparing with a baseline",
    "tag": "examplePageFail",
    "instanceData": {
      "browser": {
        "name": "chrome-headless-shell",
        "version": "126.0.6478.183"
      },
      "platform": {
        "name": "mac",
        "version": "not-known"
      }
    },
    "commandName": "checkScreen",
    "boundingBoxes": {
      "diffBoundingBoxes": [
        {
          "left": 1088,
          "top": 717,
          "right": 1186,
          "bottom": 730
        }
        //....
      ],
      "ignoredBoxes": [
        {
          "left": 159,
          "top": 652,
          "right": 356,
          "bottom": 703
        }
        //...
      ]
    },
    "fileData": {
      "actualFilePath": "/Users/wswebcreation/Git/wdio/visual-testing/.tmp/actual/desktop_chrome-headless-shellexamplePageFail-local-chrome-latest-1366x768.png",
      "baselineFilePath": "/Users/wswebcreation/Git/wdio/visual-testing/localBaseline/desktop_chrome-headless-shellexamplePageFail-local-chrome-latest-1366x768.png",
      "diffFilePath": "/Users/wswebcreation/Git/wdio/visual-testing/.tmp/diff/desktop_chrome-headless-shell/examplePageFail-local-chrome-latest-1366x768png",
      "fileName": "examplePageFail-local-chrome-latest-1366x768.png",
      "size": {
        "actual": {
          "height": 768,
          "width": 1366
        },
        "baseline": {
          "height": 768,
          "width": 1366
        },
        "diff": {
          "height": 768,
          "width": 1366
        }
      }
    },
    "misMatchPercentage": "12.90",
    "rawMisMatchPercentage": 12.900729014153246
  }
  ```

  When all tests are executed, a new JSON file with the collection of the comparisons will be generated and can be found in the root of your actual folder. The data is grouped by:

  - `describe` for Jasmine/Mocha or `Feature` for CucumberJS
  - `it` for Jasmine/Mocha or `Scenario` for CucumberJS

  and then sorted by:

  - `commandName`, which are the compare method names used to compare the images
  - `instanceData`, browser first, then device, then platform

  it will look like this

  ```json
  [
    {
      "description": "check methods",
      "data": [
        {
          "test": "should fail comparing with a baseline",
          "data": [
            {
              "tag": "examplePageFail",
              "instanceData": {},
              "commandName": "checkScreen",
              "framework": "mocha",
              "boundingBoxes": {
                "diffBoundingBoxes": [],
                "ignoredBoxes": []
              },
              "fileData": {},
              "misMatchPercentage": "14.34",
              "rawMisMatchPercentage": 14.335403703025868
            },
            {
              "tag": "exampleElementFail",
              "instanceData": {},
              "commandName": "checkElement",
              "framework": "mocha",
              "boundingBoxes": {
                "diffBoundingBoxes": [],
                "ignoredBoxes": []
              },
              "fileData": {},
              "misMatchPercentage": "1.34",
              "rawMisMatchPercentage": 1.335403703025868
            }
          ]
        }
      ]
    }
  ]
  ```

  The report data will give you the opportunity to build your own visual report without doing all the magic and data collection yourself.

  ### webdriver-image-comparison

  #### 🚀 New Features

  - Add support to generate single JSON report files

  ### @wdio/ocr-service

  #### 💅 Polish

  - Refactored the CLI to use `@inquirer/prompts` instead of `inquirer`

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

  ```

  ```

## 1.0.3

### Patch Changes

# 💅 Polish

Update deps

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
