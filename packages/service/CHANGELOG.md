# @wdio/visual-service

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
