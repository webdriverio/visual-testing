---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

## Fix: `save*` methods now always save files regardless of `alwaysSaveActualImage` setting

Previously, when `alwaysSaveActualImage: false` was set in the configuration, `save*` methods (`saveScreen`, `saveElement`, `saveFullPageScreen`, `saveAppScreen`, `saveAppElement`) were not saving files to disk, causing test failures.

The `alwaysSaveActualImage` option is intended to control whether actual images are saved during `check*` methods (comparison operations), not `save*` methods. Since `save*` methods are explicitly designed to save screenshots, they should always save files regardless of this setting.

This fix ensures:
- `save*` methods always save files to disk, even when `alwaysSaveActualImage: false` is set
- `alwaysSaveActualImage: false` continues to work correctly for `check*` methods (as intended for issue #1115)
- The behavior is now consistent: `save*` = always save, `check*` = respect `alwaysSaveActualImage` setting

# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
