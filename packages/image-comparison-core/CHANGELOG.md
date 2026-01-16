# @wdio/image-comparison-core

## 1.1.1

### Patch Changes

- 340fbe6: # 🐛 Bugfixes

  ## #1098 Improve error message when baseline is missing and both flags are false

  When `autoSaveBaseline = false` and `alwaysSaveActualImage = false` and a baseline image doesn't exist, the error message now provides clear guidance suggesting users set `alwaysSaveActualImage` to `true` if they need the actual image to create a baseline manually.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- e4e5b5c: # 🐛 Bugfixes

  ## #1085 autoSaveBaseline collides with the new alwaysSaveActualImage flag

  When `autoSaveBaseline` is `true` and `alwaysSaveActualImage` is `false`, actual images were still saved. This patch should fix that

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.1.0

### Minor Changes

- bde4851: This PR will implement FR #1077 which is asking not to create the actual image on success. This should create a better performance because no files are writing to the system and should make sure that there's not a lot of noise in the actual folder.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.0.2

### Patch Changes

- 8ff1bc3: # 🐛 BugFix

  ## #1078: Cursor inside shadow is shown, even with disableBlinkingCursor

  Fix option "disableBlinkingCursor" to also work within shadowdom

  # Committers: 1

  - Carlo Jeske ([@plusgut](https://github.com/plusgut))

## 1.0.1

### Patch Changes

- 79d2b1d: # 🐛 Bugfixes

  ## #1073 Normalize Safari desktop screenshots by trimming macOS window corner radius and top window shadow

  Safari desktop screenshots included the macOS window mask at the bottom and a shadow at the top. These artifacts caused incorrect detection of the viewable area for full page screenshots, which resulted in misaligned stitching. The viewable region is now calculated correctly by trimming these areas.

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- 782b98a: # 🐛 Bugfixes

  ## #1000 fix incorrect cropping and stitching of last image for fullpage screenshots on mobile

  The determination of the position of the last image in mobile fullpage webscreenshots was incorrect. This was mostly seen with iOS, but also had some impact on Android. This is now fixed

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

- 2c109b3: # 🐛 Bugfixes

  ## #1038 fix incorrect determination of ignore area

  Ignore regions with `left: 0` and `right:0` lead to an incorrect width which lead to an incorrect ignore area. This is now fixed

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 1.0.0

### Major Changes

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
  - Remove unused packages

  ***

  **Note**: This is an architectural improvement that modernizes the codebase while maintaining full backward compatibility. All existing functionality remains unchanged for users.

  ***

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
