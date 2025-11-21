---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

# 🐛 Bugfixes

## #1038 fix incorrect determination of ignore area
Ignore regions with `left: 0` and `right:0` lead to an incorrect width which lead to an incorrect ignore area. This is now fixed


# Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))