# @wdio/visual-reporter

## 0.4.10

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

## 0.4.9

### Patch Changes

- 8aaaf98: fix script for GH-pages

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.8

### Patch Changes

- 6fb85fc: Fix Windows support

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.7

### Patch Changes

- 09dbc2d: update deps

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.6

### Patch Changes

- 69d25fe: Multiple fixes:

  - update deps

## 0.4.5

### Patch Changes

- 2d033e8: update deps

## 0.4.4

### Patch Changes

- 4a4adf1: update deps

## 0.4.3

### Patch Changes

- c740c91: fix paths for cli

## 0.4.2

### Patch Changes

- a34dd5d: Update of deps

## 0.4.1

### Patch Changes

- 6fb41ff: Fix cli command

## 0.4.0

### Minor Changes

- 267c513: # 🚀 New Features `@wdio/visual-reporter`

  - Created a new demo for developing the ` @wdio/visual-reporter`. Starting the dev-server automatically generates a new sample report project
  - Added a resize of the Canvas after resizing the browser screen
  - You can now close the overlay by pressing ESC
  - Made it more clear in the overlay when there are no changes

  # 💅 Polish `@wdio/visual-reporter`

  - refactor of the assets generation to make it more robust for the demo and external collected files
  - reduce package/bundle size
  - updated to latest dependencies

  # 🐛 Bugs fixed `@wdio/visual-reporter`

  - Prevent the browser from going back in history when you press the browser back button when an overlay is opened. Now the overlay is closed.

## 0.3.0

### Minor Changes

- 786248e: Upgrade Jimp to the latest major

## 0.2.0

### Minor Changes

#### Fix [522](https://github.com/webdriverio/visual-testing/issues/522): visual-reporter logs an error when there is no diff file

The output contained a `diffFolderPath` when no diff was present. This resulted in an error in the logs which is fixed with this PR

#### Fix [524](https://github.com/webdriverio/visual-testing/issues/524): Highlights are shown after re-render

When a diff is highlighted and the page was re-rendered it also showed the highlighted box again. This was very confusing and annoying

#### 💅 New Feature: Add ignore boxes on the canvas

If ignore boxes are used then the canvas will also show them

<img width="1847" alt="image" src="https://github.com/user-attachments/assets/45d34d53-becc-4652-8f9b-a259240c2589">

#### 💅 New Feature: Add hover effects on the diff and ignore boxes

When you now hover over a diff or ignore area you will now see that the box will be highlighted and has a text above it

**Diff area**

<img width="436" alt="image" src="https://github.com/user-attachments/assets/34728d87-8981-47c8-8f91-5c3d19431b27">

**Ignore area**

<img width="495" alt="image" src="https://github.com/user-attachments/assets/c8df6edc-ab9e-46e6-a09e-7d89d53b4a37">

#### 💅 Update dependencies

We've update all dependencies.

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.1.7

### NEW PACKAGE

This is the first release of the new `@wdio/visual-reporter` module. With this module, in combination with the `@wdio/visual-service` module, you can now create beautiful HTML reports where you can view the results.

To make use of this utility, you need to have the 'output.json' file generated by the Visual Testing service. This file is only generated when you have the following in your configuration:

```ts
export const config = {
    // ...
    services: [
        [
            // Also installed as a dependency
            "visual-regression",
            {
                createJsonReportFiles: true,
            },
        ],
    ],
    },
}
```

For more information, please refer to the WebdriverIO Visual Testing [documentation](https://webdriver.io/docs/visual-testing).

#### Installation

The easiest way is to keep `@wdio/visual-reporter` as a dev-dependency in your `package.json`, via:

```sh
npm install @wdio/visual-reporter --save-dev
```

##### The CLI

https://github.com/user-attachments/assets/eeb22692-928c-4734-a49b-0e22655d2a1d

##### The Visual Reporter

https://github.com/user-attachments/assets/9cdfec36-e1ff-4b48-a842-23f3f7d5768e
