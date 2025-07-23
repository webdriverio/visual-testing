# @wdio/image-comparison-core

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

    -   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
