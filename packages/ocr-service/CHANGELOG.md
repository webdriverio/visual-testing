# @wdio/ocr-service

## 3.0.0

### Major Changes

- 104fb89: feat!: support WebdriverIO v10 only
  
  All changes that users can notice in v11, also the fixes in `@wdio/image-comparison-core` 3.0.0, are in the [v11 migration guide](https://github.com/webdriverio/visual-testing/blob/main/docs/v11-migration.md).
  
  `@wdio/visual-service` v11, `@wdio/image-comparison-core` v3 and `@wdio/ocr-service` v3 support only WebdriverIO v10. WebdriverIO v10 needs Node.js 22.19 or later.
  
  **What changed**
  
  - The `@wdio/globals`, `@wdio/logger` and `@wdio/types` dependencies are now `^10.0.0` (before: `^9.29.1 || ^10.0.0`).
  - The code paths for WebdriverIO v9 are removed. For example, a multiremote browser or element is found only with the `isMultiRemote` flag of WebdriverIO v10, not with the `isMultiremote` flag of WebdriverIO v9.
  - The visual service finds the browser of an element, and a multiremote element, with the kind brand of WebdriverIO v10 (`Symbol.for('wdio.kind')`). `toMatchElementSnapshot()` gives a clear error for a value that is not a WebdriverIO v10 element.
  
  **If you use WebdriverIO v9**
  
  Stay on `@wdio/visual-service@10`, `@wdio/image-comparison-core@2` and `@wdio/ocr-service@2`. They are in maintenance on the `v10` branch, and fixes are backported on request.

### Patch Changes

- e9c18f9: fix: declare `webdriverio` as a peer dependency
  
  `@wdio/visual-service` and `@wdio/ocr-service` import `webdriverio` at runtime, and the types of `@wdio/image-comparison-core` use the `webdriverio` types, but the packages did not declare it. They now have the peer dependency `webdriverio: ^10.0.0`. A WebdriverIO project always has `webdriverio` installed, so no change is needed in your project.
- 4c63e9a: chore: upgrade `@inquirer/prompts` to 8 for the CLI wizards
  
  `@inquirer/prompts` 8.7.3 is ESM only and needs Node.js `^20.17.0`, `^22.13.0` or `>=23.5.0`. Both packages now need Node.js 22.19 or newer (like WebdriverIO 10), so this changes nothing for users. The wizards work the same; the prompt colors now come from Node.js `styleText`.
- 5557e9e: chore: declare Node.js `>=22.19.0`, the same as WebdriverIO 10
  
  All packages now declare `"engines": { "node": ">=22.19.0" }`, like every package of WebdriverIO 10.
  
  - `@wdio/image-comparison-core`, `@wdio/visual-service` and `@wdio/ocr-service` did not declare a Node.js version, but they already needed 22.19 or newer through WebdriverIO 10.
  - `@wdio/visual-reporter` declared `>=20.0.0`. Node.js 20 is end-of-life, and the reporter CLI is used together with WebdriverIO 10, so it now also needs Node.js 22.19 or newer.
- 17f3201: fix: type `clickDuration` as `number` instead of the wrapper object type `Number`
  
  The `clickDuration` option of `ocrClickOnText` used the type `Number`. It now uses `number`, like the other numeric options.
- d263218: chore: upgrade `tesseract.js` from 5 to 7
  
  OCR with the built-in Tesseract (when no system Tesseract is installed) is about 15 % faster, and the memory leak of tesseract.js 5 (memory grew over time until a crash) is fixed. The found text and word positions are the same. Since tesseract.js 6 only the `text` output is on by default, so the service now asks for the `hocr` output, which it uses for the word positions.

## 2.3.1

### Patch Changes

- 525a75a: chore: accept the WebdriverIO 10 releases instead of the 10.0.0 prereleases

  The `@wdio/globals`, `@wdio/logger` and `@wdio/types` ranges change from `^9.29.1 || ^10.0.0-0` to `^9.29.1 || ^10.0.0`. WebdriverIO 10.0.0 is released, so the alpha versions are no longer accepted. WebdriverIO v9 (9.29.1 and later) is still supported.

## 2.3.0

### Minor Changes

- c1a5b84: feat: support WebdriverIO v10 (keep WebdriverIO v9 support)

  `@wdio/visual-service` and `@wdio/ocr-service` now run with WebdriverIO v10. WebdriverIO v9 (9.29.1 and later) is still supported. WebdriverIO v10 needs Node.js 22.19 or later.

  **What changed**

  - The `@wdio/globals`, `@wdio/logger` and `@wdio/types` dependencies accept v9 and v10.
  - `expect-webdriverio` is no longer a dependency of `@wdio/visual-service`. The service uses only its `ExpectWebdriverIO` types, which your `@wdio/globals` gives. This removes a second `expect-webdriverio` copy and peer dependency warnings (for example with pnpm).
  - Multiremote: the services read `isMultiRemote` (v10) and `isMultiremote` (v9). Before, a multiremote session on v10 did not get the visual and OCR commands.
  - Multiremote mobile emulation is set on each instance with `instances` and `getInstance()`, which are available in v9 and v10.
  - Multiremote: the commands of each instance (for example `browser.getInstance('chrome').checkScreen()`) use the context of that instance. Before, all instances used the context of the last instance, so with a web instance and a native app instance, the web check ran as a native app check and saved a `...-NaNxNaN.png` file.
  - Chrome and Edge `mobileEmulation.deviceName` in a WebDriver BiDi session: in v10, `emulate('device')` can fail (for example `emulation.setTextLayoutModeOverride` is not supported by Chrome 154), and the service setup then stopped, so the visual matchers were missing. The service now sets the viewport and the device pixel ratio of the device that the browser emulates, so the screenshots keep the resolution of the device. In v9 nothing changes.
  - Storybook: the loader uses `execute()` with an `async` function, because v10 removed `executeAsync()`. The clip selector uses `$(selector, { strict: false })`, because `$` is strict in v10.
  - Element screenshots: the service gets the browser of an element whose parent is a v10 browsing context.
  - Appium `mobile:` commands use `executeScript()`. In a WebDriver BiDi session (Appium 3, required by v10), `execute()` runs the script as page JavaScript.
  - Jasmine: the visual matchers (`toMatchScreenSnapshot` and the others) now work with `framework: 'jasmine'`, in WebdriverIO v9 and v10. Before, they were never added, because the Jasmine `expect` has no `extend()`. The service now adds them as Jasmine async matchers.
  - When the matchers cannot be added, the warning now gives the reason. Before, it always said "Expect package not found".
  - When the service cannot add its commands (for example when a WebDriver command of its setup fails), the visual matchers are still added, the service logs the reason, and a matcher fails with `The visual service did not add the "checkScreen" command to this session`. Before, the only error was `expect(...).toMatchScreenSnapshot is not a function`.
  - When an ignored element was not found, the error now shows the selector and the reason, for example `element "~button-LOGIN" could not be found: StrictSelectorError: ...`. Before, it showed the element as JSON.
  - `ignore` elements: before the comparison, each element is found again in its own scope (the element or browsing context it was found from) and at its own index. Before, the service searched the whole page with the selector and took the elements in order, so an element of a filtered `$$().filter()` list, of a chained `$('form').$$('input')` query or of a frame could be replaced by another element with the same selector.

  **Known limits**

  - In a WebDriver BiDi session, an element screenshot of an element in a frame is not supported: with WebdriverIO v9 `switchFrame()` the image is moved by the position of the frame, and with v10 `context.frame()` the command fails. With WebDriver Classic (`'wdio:enforceWebDriverClassic': true`), it works with v9 and v10. See #1228.

  **Upgrading to WebdriverIO v10**

  - In WebdriverIO v10, `$()` throws a `StrictSelectorError` when the selector finds more than one element. This applies to elements in `ignore` and to `checkElement()` / `toMatchElementSnapshot()`. Use `$$()`, `$(selector, { strict: false })` or a more specific selector. `hideElements` and `removeElements` are not affected.

  ### Committers: 1

  - David Prevost ([@dprevost-LMI](https://github.com/dprevost-LMI))

## 2.2.10

### Patch Changes

- 6cd5742: ### Dependency updates

  Updated dependencies across all packages to their latest compatible versions. This includes the WebdriverIO toolchain (`webdriverio`, `@wdio/*`) to `9.29.1`, the TypeScript ESLint plugins to `8.62.0`, Vitest to `3.2.6`, and various other packages such as `sharp`, `@remix-run/*`, `fuse.js` and `expect-webdriverio`. There are no functional or API changes.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 2.2.9

### Patch Changes

- db33fa7: #### `@wdio/image-comparison-core` and `@wdio/ocr-service` Security: update jimp (CVE in `file-type` transitive dep)

  Bumped `jimp` to the latest version to resolve a reported vulnerability in its `file-type` transitive dependency (see [#1130](https://github.com/webdriverio/visual-testing/issues/1130), raised by [@denis-sokolov](https://github.com/denis-sokolov), thank you!).

  **Actual impact on these packages**
  `file-type` is used by `@jimp/core` solely to detect image MIME types when reading a buffer. In both `@wdio/image-comparison-core` and `@wdio/ocr-service`, every image passed to jimp originates from either WebDriver screenshots (browser-controlled base64 data) or local files written by the framework itself. There is no code path where untrusted external input is fed directly into jimp, which removes the exploitability that the CVE describes.

  That said, the reputational and compliance risk was real, security scanners flag the package as vulnerable, enterprise users hit audit failures, and some organisations block installation of packages with known CVEs. The update addresses all of that.

  #### `@wdio/visual-reporter` and `@wdio/visual-service`

  Updated internal dependencies to pick up the jimp bump in `@wdio/image-comparison-core`.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 2.2.8

### Patch Changes

- e4e5b5c: # 🐛 Bugfixes

  ## #1085 autoSaveBaseline collides with the new alwaysSaveActualImage flag

  When `autoSaveBaseline` is `true` and `alwaysSaveActualImage` is `false`, actual images were still saved. This patch should fix that

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 2.2.7

### Patch Changes

- 75d31d1: fix: [657](#657) in multiremote, commands are now executed on the requested instances (ocrGetText no longer loop)

  ## Committers: 1

  - P-Courteille ([@P-Courteille](https://github.com/P-Courteille))

## 2.2.6

### Patch Changes

- 42956e4: 🔧 Other

  - 🆙 Updated dependencies

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
