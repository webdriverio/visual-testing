---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---


# 🐛 Bugfixes

## #1000 fix incorrect cropping and stitching of last image for fullpage screenshots on mobile

The determination of the position of the last image in mobile fullpage webscreenshots was incorrect. This was mostly seen with iOS, but also had some impact on Android. This is now fixed


# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
