---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

# 🐛 Bugfixes

## #1073 Normalize Safari desktop screenshots by trimming macOS window corner radius and top window shadow

Safari desktop screenshots included the macOS window mask at the bottom and a shadow at the top. These artifacts caused incorrect detection of the viewable area for full page screenshots, which resulted in misaligned stitching. The viewable region is now calculated correctly by trimming these areas.

# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
