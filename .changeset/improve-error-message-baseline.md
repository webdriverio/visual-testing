---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

# 🐛 Bugfixes

## #1098 Improve error message when baseline is missing and both flags are false

When `autoSaveBaseline = false` and `alwaysSaveActualImage = false` and a baseline image doesn't exist, the error message now provides clear guidance suggesting users set `alwaysSaveActualImage` to `true` if they need the actual image to create a baseline manually.

# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
