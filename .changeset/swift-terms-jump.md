---
"@wdio/image-comparison-core": patch
"@wdio/visual-reporter": patch
"@wdio/visual-service": patch
"@wdio/ocr-service": patch
---

# 🐛 Bugfixes

## #1085 autoSaveBaseline collides with the new alwaysSaveActualImage flag

When `autoSaveBaseline` is `true` and `alwaysSaveActualImage` is `false`, actual images were still saved. This patch should fix that

# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
