---
"@wdio/visual-service": patch
---

## Fix: support `appium:options` nested capability format and `avd` fallback (#1118)

Appium caps need to be prefixed with `appium:`, but this can feel redundant when you have a lot of caps. So you can also put them inside the `appium:options`-object. This was not supported by the visual module and was reported in #1118. It is now supported.

The following capabilities are now correctly read from both `appium:`-prefixed top-level format and the nested `appium:options` format:
- `deviceName`
- `nativeWebScreenshot`
- `avd` (new, see below)

Second issue that is fixed is that for Android the `deviceName` could be left away and the `avd` could be provided. This is now also supported where `deviceName` takes priority over `avd` if both are provided.

# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
