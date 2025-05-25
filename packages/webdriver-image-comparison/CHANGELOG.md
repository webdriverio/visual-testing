# webdriver-image-comparison

## 9.0.4

### Patch Changes

- d88d8dd: Optimize Mobile and Emulated device support

  ## 🐛 Bugfixes

  ### #969 Fix layer injection on mobile devices

  On some devices the layer injection, to determine the exact position of the webview, was failing. It exceeded the appium timeout and returned an error like

  ```logs
  [1] [0-0] 2025-05-23T08:04:11.788Z INFO webdriver: COMMAND getUrl()
  [1] [0-0] 2025-05-23T08:04:11.789Z INFO webdriver: [GET] https://hub-cloud.browserstack.com/wd/hub/session/xxxxx/url
  [1] [0-0] 2025-05-23T08:04:12.036Z INFO webdriver: RESULT about:blank
  [1] [0-0] 2025-05-23T08:04:12.038Z INFO webdriver: COMMAND navigateTo("data:text/html;base64,CiAgICAgICAgPG .... LONG LIST OF CHARACTERS=")
  [1] [0-0] 2025-05-23T08:04:12.038Z INFO webdriver: [POST] https://hub-cloud.browserstack.com/wd/hub/session/xxxx/url
  [1] [0-0] 2025-05-23T08:04:12.038Z INFO webdriver: DATA {
  [1] [0-0]   url: 'data:text/html;base64,CiAgICAgICAgPGh0bWw.... LONG LIST OF CHARACTERS='
  [1] [0-0] }
  [1] [0-0] 2025-05-23T08:05:42.132Z ERROR @wdio/utils:shim: Error: WebDriverError: The operation was aborted due to timeout when running "url" with method "POST" and args "{"url":"data:text/html;base64,CiAgICAgICAgPGh0b.... LONG LIST OF CHARACTERS="}"
  [1] [0-0]     at FetchRequest._libRequest (file:///xxxxxxx/node_modules/webdriver/build/node.js:1836:13)
  [1] [0-0] 2025-05-23T08:05:42.132Z DEBUG @wdio/utils:shim: Finished to run "before" hook in 91147ms
  [1] [0-0]     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
  [1] [0-0]     at async FetchRequest._request (file:///C:/xxxxxx/node_modules/webdriver/build/node.js:1846:20)
  [1] [0-0]     at Browser.wrapCommandFn (c:/Projects/xxxxxx/node_modules/@wdio/utils/build/index.js:907:23)
  [1] [0-0]     at Browser.url (c:/Projects/xxxxxxx/node_modules/webdriverio/build/node.js:5682:3)
  [1] [0-0]     at Browser.wrapCommandFn (c:/Projects/xxxxxx/node_modules/@wdio/utils/build/index.js:907:23)
  [1] [0-0]     at async loadBase64Html (file:///C:/Projects/xxxxxx/node_modules/webdriver-image-comparison/dist/helpers/utils.js:377:5)
  [1] [0-0]     at async getMobileViewPortPosition (file:///C:/Projects/xxxxxx/node_modules/webdriver-image-comparison/dist/helpers/utils.js:417:9)
  [1] [0-0]     at async getMobileInstanceData (file:///C:/Projects/xxxxxx/node_modules/@wdio/visual-service/dist/utils.js:58:28)
  [1] [0-0]     at async getInstanceData (file:///C:/Projects/xxxxxxx/node_modules/@wdio/visual-service/dist/utils.js:189:77)
  [1] [0-0] 2025-05-23T08:05:42.144Z INFO @wdio/browserstack-service: Update job with sessionId xxxxx
  ```

  This was caused by the `await url(`data:text/html;base64,${base64Html}`)` that injected the layer. Some browsers couldn't handle the `data:text/html;base64`.

  We now fixed that with a different injection. It was tested on Android/iOS and on Sims/Emus/Real Devices and it worked

  ### Improve determining if a device is emulated

  In a previous release we added a function to determine if a device was emulated. This resulted in incorrect screen sizes that were used for the files names for devices. This caused or failing baselines, or new files to be created because the screen sizes were not available
  We now improved the check and the correct screen sizes are added again to the file names and made sure that the previous generated base line could be used again.

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 9.0.3

### Patch Changes

- 2f9ec42: ## 🐛 Bug-fixes

  ### #967: Emulated device crops with `enableLegacyScreenshotMethod` set to `true` are not correct

  When a screenshot of an emulated device is taken, but the browser was initially started as a "desktop" session, so not with emulated caps, and the `enableLegacyScreenshotMethod` property is set to `true`, the DPR of the emulated device is taken. This resulted in incorrect crop. We now store the original dpr and use that for the crop when it's an emulated device and started as a desktop browser session.

  ## BiDi Fullpage screenshots for emulated device are broken

  The BiDi fullpage screenshot for an emulated device is broken in the driver. We now fallback to the legacy screenshot method for BiDi and emulated devices

  ## 💅 Polish

  - Updated the multiple interfaces to use JS-Doc for better docs
  - When `createJsonReportFiles` is set to `true` and there are a lot of differences we kept waiting. We now limited that to check a max of 5M diff-pixels or a diff threshold of 20%. If it's bigger the report will show a full coverage and extra logs are shown in the WDIO logs, something like this

  ```logs
  [0-0] 2025-05-24T06:02:18.887Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Processing diff pixels started
  [0-0] 2025-05-24T06:02:18.888Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Processing 20143900 diff pixels
  [0-0] 2025-05-24T06:02:19.770Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Total pixels in image: 52,184,160
  [0-0] 2025-05-24T06:02:19.770Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Number of diff pixels: 20,143,900
  [0-0] 2025-05-24T06:02:19.770Z INFO @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Diff percentage: 38.60%
  [0-0] 2025-05-24T06:02:19.770Z ERROR @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Too many differences detected! Diff percentage: 38.60%, Diff pixels: 20,143,900
  [0-0] 2025-05-24T06:02:19.771Z ERROR @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: This likely indicates a major visual difference or an issue with the comparison.
  [0-0] 2025-05-24T06:02:19.771Z ERROR @wdio/visual-service:webdriver-image-comparison:pixelDiffProcessing: Consider checking if the baseline image is correct or if there are major UI changes.
  ```

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 9.0.2

### Patch Changes

- 9363467: ## 🐛 Bug-fixes

  - #946: Visual Regression Changes in WDIO v9
    - Fixed screen size detection in emulated mode for filenames. Previously used incorrect browser window size.
    - Fixed screenshot behavior when `enableLegacyScreenshotMethod: true`, now correctly captures emulated screen instead of complete screen.
    - Fixed emulated device handling for Chrome and Edge browsers, now properly sets device metrics based on `deviceMetrics` or `deviceName` capabilities.

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 9.0.1

### Patch Changes

- 5c6c6e2: Fix capturing element screenshots with BiDi

  This release fixes #919 where an element screenshot, that was for example from an overlay, dropdown, popover, tooltip, modal, was returning an incorrect screenshot

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 9.0.0

### Major Changes

- bfe6aca: ## 💥 BREAKING CHANGES

  ### 🧪 Web Screenshot Strategy Now Uses BiDi by Default

  #### What was the problem?

  Screenshots taken via WebDriver's traditional protocol often lacked precision:

  - Emulated devices didn't reflect true resolutions
  - Device Pixel Ratio (DPR) was often lost
  - Images were cropped or downscaled

  #### What changed?

  All screenshot-related methods now use the **WebDriver BiDi protocol** by default (if supported by the browser), enabling:

  ✅ Native support for emulated and high-DPR devices
  ✅ Better fidelity in screenshot size and clarity
  ✅ Faster, browser-native screenshots via [`browsingContext.captureScreenshot`](https://w3c.github.io/webdriver-bidi/#command-browsingContext-captureScreenshot)

  The following methods now use BiDi:

  - `saveScreen` / `checkScreen`
  - `saveElement` / `checkElement`
  - `saveFullPageScreen` / `checkFullPageScreen`

  #### What’s the impact?

  ⚠️ **Existing baselines may no longer match.**
  Because BiDi screenshots are **sharper** and **match device settings more accurately**, even a small difference in resolution or DPR can cause mismatches.

  > If you rely on existing baseline images, you'll need to regenerate them to avoid false positives.

  #### Want to keep using the legacy method?

  You can disable BiDi screenshots globally or per test using the `enableLegacyScreenshotMethod` flag:

  **Globally in `wdio.conf.ts`:**

  ```ts
  import { join } from "node:path";

  export const config = {
    services: [
      [
        "visual",
        {
          baselineFolder: join(process.cwd(), "./localBaseline/"),
          debug: true,
          formatImageName: "{tag}-{logName}-{width}x{height}",
          screenshotPath: join(process.cwd(), ".tmp/"),
          enableLegacyScreenshotMethod: true, // 👈 fallback to W3C-based screenshots
        },
      ],
    ],
  };
  ```

  **Or per test:**

  ```ts
  it("should compare an element successfully using legacy screenshots", async function () {
    await expect($(".hero__title-logo")).toMatchElementSnapshot(
      "legacyScreenshotLogo",
      { enableLegacyScreenshotMethod: true } // 👈 fallback to W3C-based screenshots
    );
  });
  ```

  ## 🐛 Bug Fixes

  - ✅ [#916](https://github.com/webdriverio/visual-testing/issues/916): Visual Testing Screenshot Behavior Changed in Emulated Devices

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 8.0.0

### Major Changes

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

## 7.4.0

### Minor Changes

- 7f859aa: Add `additionalSearchParams` to the Storybook Runner API
- 307fbec: Add `getStoriesBaselinePath` to Storybook Runner API, enabling custom file paths (e.g. files with a flat hierarchy in the baselines folder)

### Committers: 2

- Fábio Correia [@fabioatcorreia](https://github.com/fabioatcorreia)
- alcpereira ([@alcpereira](https://github.com/alcpereira))

## 7.3.2

### Patch Changes

- 09dbc2d: update deps

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 7.3.1

### Patch Changes

- 69d25fe: Multiple fixes:

  - update deps

## 7.3.0

### Minor Changes

- 2d033e8: #691 Add option to ignore blinking cursors / carets

### Patch Changes

- Updated dependencies [2d033e8]

## 7.2.2

### Patch Changes

- 4a4adf1: Fix resize dimensions for mobile
- 4a4adf1: update deps

## 7.2.1

### Patch Changes

- 1df5350: # Improve iPhone support

  ## 💅 Polish @wdio/visual-reporter

  - Mobile: support iOS 18 and the iPhone 16 series for the blockouts

  ## 🐛 Bugs fixed @wdio/visual-reporter

  - Mobile: don't use the device blockouts for element screenshot
  - Mobile: when the blockouts had the value `{x: 0, y: 0, width: 0, height: 0}` then Resemble picked this up as a full blockout. This caused false positives for iOS

## 7.2.0

### Minor Changes

- 786248e: Upgrade Jimp to the latest major

## 7.1.0

### Minor Changes

#### 💅 New Feature: Remove diff image before comparing

This solves the issue [425](https://github.com/webdriverio/visual-testing/issues/425) of removing a diff image from the diff folder for success. We now remove the "previous" diff image before we execute the compare so we also have the latest, or we now have a diff image after a retry where the first run failed and produced an image and a new successful run.

#### 💅 Update dependencies

We've update all dependencies.

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 7.0.0

### Major Changes

- 9fdb2d2: feat: work with V9

## 6.1.1

### Patch Changes

- 85a1d82: # 🐛 Bug Fixes

  Fix issues:

  - [438](https://github.com/webdriverio/visual-testing/issues/438): resizeDimensions not working
  - [448](https://github.com/webdriverio/visual-testing/issues/448): hideElements and removeElements` don't work for native apps

  # 💅 Polish

  - update dependencies

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 6.1.0

### Minor Changes

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

## 6.0.2

### Patch Changes

# 💅 Polish

- Update deps

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 6.0.1

### Patch Changes

- 169b7c5: fix(webdriver-image-comparison): export WicElement

## 6.0.0

### Major Changes

- 66b9f11: # 💥 Breaking

  This PR replaces Canvas as a dependency with Jimp. This removes the need to use system dependencies and will reduce the number of system dependency errors/issues (node-gyp/canvas and so on). This will, in the end, make the life of our end users way easier due to:

  - less errors
  - less complex test environments

  > [!note]
  > Extensive research has been done and we have chosen to "fork" ResembleJS, adjust it by making use of Jimp instead of Canvas and break the browser API because the fork will only be used in a nodejs environment
  > Investigation showed that creating a wrapper would even make it slower, so we went for the breaking change in the API by just replacing Canvas with Jimp

  > [!important]
  > There is a performance impact where Canvas is around 70% faster than Jimp. This has been measured without using WebdriverIO and only comparing images. When the "old" implementation with WebdriverIO combined with Canvas or Jimp is compared, we hardly see a performance impact.

  # 🚀 New Features

  Update the baseline images through the command line by adding the argument `--update-visual-baseline`. This will

  - automatically copy the actual take screenshot and put it in the baseline folder
  - if there are differences it will let the test pass because the baseline has been updated

  **Usage:**

  ```sh
  npm run test.local.desktop  --update-visual-baseline
  ```

  When running logs info/debug mode you will see the following logs added

  ```logs
  [0-0] ..............
  [0-0] #####################################################################################
  [0-0]  INFO:
  [0-0]  Updated the actual image to
  [0-0]  /Users/wswebcreation/Git/wdio/visual-testing/localBaseline/chromel/demo-chrome-1366x768.png
  [0-0] #####################################################################################
  [0-0] ..........
  ```

  # 💅 Polish

  - remove Vitest fix
  - add app images
  - update the build

## 5.1.0

### Minor Changes

- c9fab82: change console.log to wdio logger

## 5.0.1

### Patch Changes

- f878cab: # 🚀 Feature

  - Add device support for Storybook, it can be used like this

  ```sh
  npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --devices="iPhone 14 Pro Max","Pixel 3 XL"
  ```

  #### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 5.0.0

### Major Changes

- b717d9a: # 💥 Breaking changes

  - the new element screenshot is producing "smaller" screenshots on certain Android OS versions (not all), but it's more "accurate" so we accept this

  # 🚀 New Features

  ## Add StoryBook📖 support

  Automatically scan local/remote storybook instances to create element screenshots of each component by adding

  ```ts
  export const config: WebdriverIO.Config = {
    // ...
    services: ["visual"],
    // ....
  };
  ```

  to your `services` and running `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook` through the command line.
  It will automatically use Chrome. The following options can be provided through the command line

  - `--headless`, defaults to `true`
  - `--numShards {number}`, this will be the amount of parallel instances that will be used to run the stories. This will be limited by the `maxInstances` in your `wdio.conf`-file. When running in `headless`-mode then do not increase the number to more than 20 to prevent flakiness
  - `--clip {boolean}`, try to take an element instead of a viewport screenshot, defaults to `true`
  - `--clipSelector {string}`, this is the selector that will be used to:

    - select the element to take the screenshot of
    - the element to wait for to be visible before a screenshot is taken

    defaults to `#storybook-root > :first-child` for V7 and `#root > :first-child:not(script):not(style)` for V6

  - `--version`, the version of storybook, defaults to 7. This is needed to know if the V6 `clipSelector` needs to be used.
  - `--browsers {edge,chrome,safari,firefox}`, defaults to Chrome
  - `--skipStories`, this can be:
    - a string (`example-button--secondary,example-button--small`)
    - or a regex (`"/.*button.*/gm"`) to skip certain stories

  You can also provide service options

  ```ts
  export const config: WebdriverIO.Config  = {
      // ...
      services: [
        [
          'visual',
          {
              // Some default options
              baselineFolder: join(process.cwd(), './__snapshots__/'),
              debug: true,
              // The storybook options
              storybook: {
                  clip: false,
                  clipSelector: ''#some-id,
                  numShards: 4,
                  skipStories: ['example-button--secondary', 'example-button--small'],
                  url: 'https://www.bbc.co.uk/iplayer/storybook/',
                  version: 6,
              },
          },
        ],
      ],
      // ....
  }
  ```

  The baseline images will be stored in the following structure:

  ```log
  {projectRoot}
  |_`__snapshots__`
    |_`{category}`
      |_`{componentName}`
        |_{browserName}
          |_`{{component-id}-element-{browser}-{resolution}-dpr-{dprValue}}.png`
  ```

  which will look like this

  ![image](https://github.com/webdriverio/visual-testing/assets/11979740/7c41a8b4-2498-4e85-be11-cb1ec601b760)

  > [!NOTE]
  > Storybook 6.5 or higher is supported

  # 💅 Polish

  - `hideScrollBars` is disabled by default when using the Storybook runner
  - By default, all element screenshots in the browser, except for iOS, will use the native method to take element screenshots. This will make taking an element screenshot more than 5% faster. If it fails it will fall back to the "viewport" screenshot and create a cropped element screenshot.
  - Taking an element screenshot becomes 70% faster due to removing the fixed scroll delay of 500ms and changing the default scrolling behaviour to an instant scroll
  - refactor web element screenshots and update the screenshots
  - added more UTs to increase the coverage

  # 🐛 Bug Fixes

  - When the element has no height or width, we default to the viewport screen size to prevent not cropping any screenshot. An error like below will be logged in red

  ```logs

  The element has no width or height. We defaulted to the viewport screen size of width: ${width} and height: ${height}.

  ```

  - There were cases where element screenshots were automatically rotated which was not intended

## 4.1.0

### Minor Changes

- 43ed502: Add font loading features:
  - add `waitForFontsLoaded` so the module automatically waits for all fonts to be loaded, enabled by default
  - add `enableLayoutTesting` so all text will become transparent so
    - font rendering issues won't cause flakiness
    - image comparison can be done on layout

## 4.0.2

### Patch Changes

- c8fdcd3: Fix to override visibility/display value

## 4.0.1

### Patch Changes

- fd74a35: (feat): set default baseline folder next to test file

## 4.0.0

### Major Changes

- ef386b6: # 💥 Breaking changes:

  - `resizeDimensions` on the element can now only be an object, it has been deprecated for a while

  # 💅 New Features

  - Next to supporting Web snapshot testing this module now also supports 💥 **Native App** 💥 snapshot testing. The methods `saveElement|checkElement | saveScreen | checkScreen` and the matchers `toMatchElementSnapshot |  toMatchScreenSnapshot` are available for **Native Apps**

  > [!NOTE]
  > This module will automatically detect the context (web | webview | native_app) and will handle all complex logic for you

  The methods `saveFullPageScreen | checkFullPageScreen | saveTabbablePage|checkTabbablePage` will throw an error when they are used in the native context for native mobile apps and will look like this

  ```logs
  $ wdio tests/configs/wdio.local.android.emus.app.conf.ts

  Execution of 1 workers started at 2024-01-30T06:18:24.865Z

  [0-0] RUNNING in Android - file:///tests/specs/mobile.app.spec.ts
  [0-0] Error in "@wdio/visual-service mobile app.should compare a screen successful for 'Pixel_7_Pro_Android_14_API_34' in PORTRAIT-mode"
  Error: The method saveFullPageScreen is not supported in native context for native mobile apps!
      at /wdio/visual-testing/packages/webdriver-image-comparison/src/commands/saveFullPageScreen.ts:26:15
      at step (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:33:23)
      at Object.next (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:14:53)
      at /wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:8:71
      at new Promise (<anonymous>)
      at __awaiter (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:4:12)
      at saveFullPageScreen (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:47:12)
      at Browser.<anonymous> (file:///wdio/visual-testing/packages/service/dist/service.js:101:24)
  [0-0] FAILED in Android - file:///tests/specs/mobile.app.spec.ts

   "spec" Reporter:
  ------------------------------------------------------------------
  [/wdio/visual-testing/apps/app.apk Android #0-0] Running: /wdio/visual-testing/apps/app.apk on Android
  [/wdio/visual-testing/apps/app.apk Android #0-0] Session ID: c1101184-e3d5-42b5-a31f-8ebaa211f1a1
  [/wdio/visual-testing/apps/app.apk Android #0-0]
  [/wdio/visual-testing/apps/app.apk Android #0-0] » /tests/specs/mobile.app.spec.ts
  [/wdio/visual-testing/apps/app.apk Android #0-0] @wdio/visual-service mobile app
  [/wdio/visual-testing/apps/app.apk Android #0-0]    ✖ should compare a screen successful for 'Pixel_7_Pro_Android_14_API_34' in PORTRAIT-mode
  [/wdio/visual-testing/apps/app.apk Android #0-0]
  [/wdio/visual-testing/apps/app.apk Android #0-0] 1 failing (1.5s)
  [/wdio/visual-testing/apps/app.apk Android #0-0]
  [/wdio/visual-testing/apps/app.apk Android #0-0] 1) @wdio/visual-service mobile app should compare a screen successful for 'Pixel_7_Pro_Android_14_API_34' in PORTRAIT-mode
  [/wdio/visual-testing/apps/app.apk Android #0-0] The method saveFullPageScreen is not supported in native context for native mobile apps!
  [/wdio/visual-testing/apps/app.apk Android #0-0] Error: The method saveFullPageScreen is not supported in native context for native mobile apps!
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at /wdio/visual-testing/packages/webdriver-image-comparison/src/commands/saveFullPageScreen.ts:26:15
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at step (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:33:23)
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at Object.next (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:14:53)
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at /wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:8:71
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at new Promise (<anonymous>)
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at __awaiter (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:4:12)
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at saveFullPageScreen (/wdio/visual-testing/packages/webdriver-image-comparison/dist/commands/saveFullPageScreen.js:47:12)
  [/wdio/visual-testing/apps/app.apk Android #0-0]     at Browser.<anonymous> (file:///wdio/visual-testing/packages/service/dist/service.js:101:24)


  Spec Files:      0 passed, 1 failed, 1 total (100% completed) in 00:00:11

  error Command failed with exit code 1.
  ```

  - `autoSaveBaseline` is true by default, so if no baseline images are present it will automatically create a new baseline
  - Mobile screenshots of the complete screen now automatically exclude all native OS elements like the notification bar, home bar, address bar, and so on, the settings `blockOutSideBar | blockOutStatusBar |blockOutToolBar` are now all defaulted to `true`
  -

  # 🐛 Fixed bugs:

  - element screenshots could also get resized dimensions, which would cut out a bigger portion around the element. This was failing when the dimensions got out of the boundaries of the official screenshot. This has now been fixed with:
    - not going outside of the screenshot
    - log extra warnings

## 3.0.1

### Patch Changes

- 488d424: (docs): update readme

## 3.0.0

### Major Changes

- 36d3868: Support for WebdriverIO v8
