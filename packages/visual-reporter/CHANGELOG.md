# @wdio/visual-reporter

## 0.4.11

### Patch Changes

- 3dbfa0e: fix: [990](#990)mclean script from package.json is now working on Windows
- 1326e99: ## 💥 Major Release: New @wdio/image-comparison-core Package

  ### 🏗️ Architectural Refactor

  This release introduces a **completely new core architecture** with the dedicated `@wdio/image-comparison-core` package, replacing the generic `webdriver-image-comparison` module with a WDIO-specific solution.

  #### What was the problem?

  - The old `webdriver-image-comparison` package was designed for generic webdriver usage
  - Complex integration between generic and WDIO-specific code
  - Limited test coverage (~58%) making maintenance difficult
  - Mixed responsibilities between core logic and service integration

  #### What changed?

  ✅ **New dedicated core package**: `@wdio/image-comparison-core` - purpose-built for WebdriverIO
  ✅ **Cleaner architecture**: Modular design with clear separation of concerns
  ✅ **Enhanced test coverage**: Improved from ~58% to ~90% across all metrics
  ✅ **Better maintainability**: Organized codebase with comprehensive TypeScript interfaces
  ✅ **WDIO-specific dependencies**: Only depends on `@wdio/logger`, `@wdio/types`, etc.

  ### 🧪 Testing Improvements

  - **100% branch coverage** on critical decision points
  - **Comprehensive unit tests** for all major functions
  - **Optimized mocks** for complex scenarios
  - **Better test isolation** and reliability

  | Before/After       | % Stmts | % Branch | % Funcs | % Lines |
  | ------------------ | ------- | -------- | ------- | ------- |
  | **Previous**       | 58.59   | 91.4     | 80.71   | 58.59   |
  | **After refactor** | 90.55   | 96.38    | 93.99   | 90.55   |

  ### 🔧 Service Integration

  The `@wdio/visual-service` now imports from the new `@wdio/image-comparison-core` package while maintaining the same public API and functionality for users.

  ### 📈 Performance & Quality

  - **Modular architecture**: Easier to maintain and extend
  - **Type safety**: Comprehensive TypeScript coverage
  - **Clean exports**: Well-defined public API
  - **Internal interfaces**: Proper separation of concerns

  ### 🔄 Backward Compatibility

  ✅ **No breaking changes** for end users
  ✅ **Same public API** maintained
  ✅ **Existing configurations** continue to work
  ✅ **All existing functionality** preserved

  ### 🎯 Future Benefits

  This refactor sets the foundation for:

  - Easier addition of new features
  - Better bug fixing capabilities
  - Enhanced mobile and native app support
  - More reliable MultiRemote functionality

  ### 📦 Dependency Updates

  - Updated most dependencies to their latest versions
  - Improved security with latest package versions
  - Better compatibility with current WebdriverIO ecosystem
  - Enhanced performance through updated dependencies

  ***

  **Note**: This is an architectural improvement that modernizes the codebase while maintaining full backward compatibility. All existing functionality remains unchanged for users.

  ***

## 0.4.10

### Patch Changes

- 42956e4: 🔧 Other

  - 🆙 Updated dependencies

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
