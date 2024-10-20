---
"webdriver-image-comparison": patch
"@wdio/visual-service": patch
---

# Improve iPhone support

## 💅 Polish @wdio/visual-reporter

-   Mobile: support iOS 18 and the iPhone 16 series for the blockouts

## 🐛 Bugs fixed @wdio/visual-reporter

-   Mobile: don't use the device blockouts for element screenshot
-   Mobile: when the blockouts had the value `{x: 0, y: 0, width: 0, height: 0}` then Resemble picked this up as a full blockout. This caused false positives for iOS
