# @wdio/ocr-service

## 2.1.0

### Minor Changes

- f5f8041: fix click duration for 0ms

### Patch Changes

- ea08748: # Fix [495](https://github.com/webdriverio/visual-testing/issues/495): module system issue when using with vite and storybook

  This fix only allows `runner` to be the `local` one, if not, it will throw this error

  ```logs
  pnpm test.local.desktop.storybook                                                                                                                                 ─╯

  > @wdio/visual-testing-monorepo@ test.local.desktop.storybook /Users/wswebcreation/Git/wdio/visual-testing
  > wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --numShards=10 --url=https://govuk-react.github.io/govuk-react/ --skipStories="/.*(loading-box|spinner).*/"


  Execution of 0 workers started at 2024-09-22T05:50:20.875Z

  SevereServiceError in "onPrepare"
  SevereServiceError:
  A service failed in the 'onPrepare' hook
  SevereServiceError:

  Running `@wdio/visual-service` is only supported in `local` mode.


      at VisualLauncher.onPrepare (file:///Users/wswebcreation/Git/wdio/visual-testing/packages/visual-service/dist/storybook/launcher.js:22:19)
      at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1209:32
      at Array.map (<anonymous>)
      at runServiceHook (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1206:31)
      at Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:13)
      at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16)



  Stopping runner...
      at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1227:29
      at async Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:7)
      at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16)
  HookError [SevereServiceError]:
  A service failed in the 'onPrepare' hook
  SevereServiceError:

  Running `@wdio/visual-service` is only supported in `local` mode.


      at VisualLauncher.onPrepare (file:///Users/wswebcreation/Git/wdio/visual-testing/packages/visual-service/dist/storybook/launcher.js:22:19)
      at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1209:32
      at Array.map (<anonymous>)
      at runServiceHook (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1206:31)
      at Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:13)
      at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16)



  Stopping runner...
      at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1227:29
      at async Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:7)
      at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16) {
    origin: 'onPrepare'
  }
   ELIFECYCLE  Command failed with exit code 1.
  ```

  # Fix [522](https://github.com/webdriverio/visual-testing/issues/522): visual-reporter logs an error when there is no diff file

  The output contained a `diffFolderPath` when no diff was present. This resulted in an error in the logs which is fixed with this PR

  # Fix [524](https://github.com/webdriverio/visual-testing/issues/524): Highlights are shown after re-render

  When a diff is highlighted and the page was re-rendered it also showed the highlighted box again. This was very confusing and annoying

  # 💅 New Feature: Add ignore boxes on the canvas

  If ignore boxes are used then the canvas will also show them
  <img width="1847" alt="image" src="https://github.com/user-attachments/assets/45d34d53-becc-4652-8f9b-a259240c2589">

  # 💅 New Feature: Add hover effects on the diff and ignore boxes

  When you now hover over a diff or ignore area you will now see that the box will be highlighted and has a text above it

  **Diff area**
  <img width="436" alt="image" src="https://github.com/user-attachments/assets/34728d87-8981-47c8-8f91-5c3d19431b27">

  **Ignore area**
  <img width="495" alt="image" src="https://github.com/user-attachments/assets/c8df6edc-ab9e-46e6-a09e-7d89d53b4a37">

  # 💅 New Feature: Remove diff image before comparing

  This solves the issue [425](https://github.com/webdriverio/visual-testing/issues/425) of removing a diff image from the diff folder for success. We now remove the "previous" diff image before we execute the compare so we also have the latest, or we now have a diff image after a retry where the first run failed and produced an image and a new successful run.

  # 💅 Update dependencies

  We've update all dependencies.

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
