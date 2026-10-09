---
"@wdio/image-comparison-core": patch
---

fix: measure the iOS viewport again when a Safari tip takes the native tap

To find the position of the webview, the service loads a test page with an overlay and makes a native tap in the center of the screen. On the first Safari start of a new simulator or device (for example in CI), iOS 26 shows a tip ("View Bookmarks, Share Menu, and Open Tabs"). The tap only closed that tip and did not reach the overlay. The service then used an empty viewport (0x0), and full page screenshots failed with "Negative scroll position detected". The service now checks the measurement on iOS too, as it already did on Android, and measures again (up to 3 attempts).
