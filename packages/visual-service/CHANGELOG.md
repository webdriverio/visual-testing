# @wdio/visual-service

## 6.3.0

### Minor Changes

- 2d033e8: Add LambdaTest support
  - #691 Add option to ignore blinking cursors / carets by providing the option `disableBlinkingCursor`
  - #692 Add support for `appium:options`

### Patch Changes

- Updated dependencies [2d033e8]
  - webdriver-image-comparison@7.3.0

## 6.2.5

### Patch Changes

- 4a4adf1: Fix resize dimensions for mobile
- 4a4adf1: update deps
- Updated dependencies [4a4adf1]
- Updated dependencies [4a4adf1]
  - webdriver-image-comparison@7.2.2

## 6.2.4

### Patch Changes

- 36541dd: Fix issue 679

## 6.2.3

### Patch Changes

- cc2b0fb: Fix issue 656

## 6.2.2

### Patch Changes

- a34dd5d: Update of deps
- d751b8c: fix android app determination

## 6.2.1

### Patch Changes

- 1df5350: # Improve iPhone support

  ## 💅 Polish @wdio/visual-reporter

  - Mobile: support iOS 18 and the iPhone 16 series for the blockouts

  ## 🐛 Bugs fixed @wdio/visual-reporter

  - Mobile: don't use the device blockouts for element screenshot
  - Mobile: when the blockouts had the value `{x: 0, y: 0, width: 0, height: 0}` then Resemble picked this up as a full blockout. This caused false positives for iOS

- Updated dependencies [1df5350]
  - webdriver-image-comparison@7.2.1

## 6.2.0

### Minor Changes

- 6e20f06: Upgrade dependencies

## 6.1.0

### Minor Changes

#### ea08748 Fix [495](https://github.com/webdriverio/visual-testing/issues/495): module system issue when using with vite and storybook

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

#### 💅 Update dependencies

We've update all dependencies.

### Patch Changes

- Updated dependencies [ea08748]
  - webdriver-image-comparison@7.1.0

## 6.0.0

### Major Changes

- 9fdb2d2: feat: work with V9

### Patch Changes

- Updated dependencies [9fdb2d2]
  - webdriver-image-comparison@7.0.0

## 5.2.1

### Patch Changes

- cae36ad: Update deps

## 5.2.0

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

### Patch Changes

- Updated dependencies [0b01b64]
  - webdriver-image-comparison@6.1.0

## 5.1.1

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

- Updated dependencies [26c1a17]
  - webdriver-image-comparison@6.0.2

## 5.1.0

### Minor Changes

- a0e29f2: Adding storybook interaction testing

  ### Storybook Interaction Testing

  Storybook Interaction Testing allows you to interact with your component by creating custom scripts with WDIO commands to set a component into a certain state. For example, see the code snippet below:

  ```ts
  import { browser, expect } from "@wdio/globals";

  describe("Storybook Interaction", () => {
    it("should create screenshots for the logged in state when it logs out", async () => {
      const componentId = "example-page--logged-in";
      await browser.waitForStorybookComponentToBeLoaded({
        id: componentId,
      });

      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-in-state`
      );
      await $("button=Log out").click();
      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-out-state`
      );
    });

    it("should create screenshots for the logged out state when it logs in", async () => {
      const componentId = "example-page--logged-out";
      await browser.waitForStorybookComponentToBeLoaded({
        id: componentId,
      });

      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-out-state`
      );
      await $("button=Log in").click();
      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-in-state`
      );
    });
  });
  ```

  Two tests on two different components are executed. Each test first sets a state and then takes a screenshot. You will also notice that a new custom command has been introduced, which can be found [here](#new-custom-command).

  The above spec file can be saved in a folder and added to the command line with the following command:

  ```sh
  npm run test.local.desktop.storybook.localhost -- --spec='tests/specs/storybook-interaction/*.ts'
  ```

  The Storybook runner will first automatically scan your Storybook instance and then add your tests to the stories that need to be compared. If you don't want the components that you use for interaction testing to be compared twice, you can add a filter to remove the "default" stories from the scan by providing the [`--skipStories`](#--skipstories) filter. This would look like this:

  ```sh
  npm run test.local.desktop.storybook.localhost -- --skipStories="/example-page.*/gm" --spec='tests/specs/storybook-interaction/*.ts'
  ```

  ### New Custom Command

  A new custom command called `browser.waitForStorybookComponentToBeLoaded({ id: 'componentId' })` will be added to the `browser/driver`-object that will automatically load the component and wait for it to be done, so you don't need to use the `browser.url('url.com')` method. It can be used like this

  ```ts
  import { browser, expect } from "@wdio/globals";

  describe("Storybook Interaction", () => {
    it("should create screenshots for the logged in state when it logs out", async () => {
      const componentId = "example-page--logged-in";
      await browser.waitForStorybookComponentToBeLoaded({
        id: componentId,
      });

      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-in-state`
      );
      await $("button=Log out").click();
      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-out-state`
      );
    });

    it("should create screenshots for the logged out state when it logs in", async () => {
      const componentId = "example-page--logged-out";
      await browser.waitForStorybookComponentToBeLoaded({
        id: componentId,
      });

      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-out-state`
      );
      await $("button=Log in").click();
      await expect($("header")).toMatchElementSnapshot(
        `${componentId}-logged-in-state`
      );
    });
  });
  ```

  The options are:

  #### `clipSelector`

  - **Type:** `string`
  - **Mandatory:** No
  - **Default:** `#storybook-root > :first-child` for Storybook V7 and `#root > :first-child:not(script):not(style)` for Storybook V6
  - **Example:**

  ```ts
  await browser.waitForStorybookComponentToBeLoaded({
    clipSelector: "#your-selector",
    id: "componentId",
  });
  ```

  This is the selector that will be used:

  - to select the element to take the screenshot of
  - for the element to wait to be visible before a screenshot is taken

  #### `id`

  - **Type:** `string`
  - **Mandatory:** yes
  - **Example:**

  ```ts
  await browser.waitForStorybookComponentToBeLoaded({ '#your-selector', id: 'componentId' })
  ```

  Use the `id` of the story that can be found in the URL of the story. For example, the `id` in this URL `http://localhost:6006/?path=/story/example-page--logged-out` is `example-page--logged-out`

  #### `timeout`

  - **Type:** `number`
  - **Mandatory:** No
  - **Default:** 1100 milliseconds
  - **Example:**

  ```ts
  await browser.waitForStorybookComponentToBeLoaded({
    id: "componentId",
    timeout: 20000,
  });
  ```

  The max timeout we want to wait for a component to be visible after loading on the page

  #### `url`

  - **Type:** `string`
  - **Mandatory:** No
  - **Default:** `http://127.0.0.1:6006`
  - **Example:**

  ```ts
  await browser.waitForStorybookComponentToBeLoaded({
    id: "componentId",
    url: "https://your.url",
  });
  ```

  The URL where your Storybook instance is hosted.

## 5.0.1

### Patch Changes

- 169b7c5: fix(webdriver-image-comparison): export WicElement
- Updated dependencies [169b7c5]
  - webdriver-image-comparison@6.0.1

## 5.0.0

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

### Patch Changes

- Updated dependencies [66b9f11]
  - webdriver-image-comparison@6.0.0

## 4.1.3

### Patch Changes

# 🐛 Bug Fixes

- Fixes https://github.com/webdriverio/visual-testing/issues/286
- Fixes https://github.com/webdriverio/visual-testing/issues/333

## 4.1.2

### Patch Changes

- 7713c13: Fix beforeTest incl types

## 4.1.1

### Patch Changes

- 4dcfeea: add missing dependency and update deps

## 4.1.0

### Minor Changes

- c9fab82: change console.log to wdio logger

### Patch Changes

- Updated dependencies [c9fab82]
  - webdriver-image-comparison@5.1.0

## 4.0.2

### Patch Changes

- f878cab: # 🚀 Feature

  - Add device support for Storybook, it can be used like this

  ```sh
  npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --devices="iPhone 14 Pro Max","Pixel 3 XL"
  ```

  #### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- Updated dependencies [f878cab]
  - webdriver-image-comparison@5.0.1

## 4.0.1

### Patch Changes

- bb4ece7: Fix storybook filtering

## 4.0.0

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

### Patch Changes

- Updated dependencies [b717d9a]
  - webdriver-image-comparison@5.0.0

## 3.1.0

### Minor Changes

- 43ed502: Add font loading features:
  - add `waitForFontsLoaded` so the module automatically waits for all fonts to be loaded, enabled by default
  - add `enableLayoutTesting` so all text will become transparent so
    - font rendering issues won't cause flakiness
    - image comparison can be done on layout

### Patch Changes

- Updated dependencies [43ed502]
  - webdriver-image-comparison@4.1.0

## 3.0.2

### Patch Changes

- 14b6ae6: Support BS real device names
  Fix hide/remove elements

## 3.0.1

### Patch Changes

- c8fdcd3: Fix to override visibility/display value
- Updated dependencies [c8fdcd3]
  - webdriver-image-comparison@4.0.2

## 3.0.0

### Major Changes

- fd74a35: (feat): set default baseline folder next to test file

### Patch Changes

- e93a878: fix default snapshot path to be overwritten through method/service options
- Updated dependencies [fd74a35]
  - webdriver-image-comparison@4.0.1

## 2.0.0

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

### Patch Changes

- Updated dependencies [ef386b6]
  - webdriver-image-comparison@4.0.0

## 1.0.0

### Major Changes

- 36d3868: Support for WebdriverIO v8

### Minor Changes

- 36d3868: (feat): add visual matcher

### Patch Changes

- Updated dependencies [36d3868]
  - webdriver-image-comparison@3.0.0
