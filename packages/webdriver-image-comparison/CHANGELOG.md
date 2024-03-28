# webdriver-image-comparison

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
  export const config: Options.Testrunner = {
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
  export const config: Options.Testrunner = {
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
