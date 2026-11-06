---
"@wdio/image-comparison-core": patch
---

fix: wait for the new page in the mobile viewport measurement

The measurement of the viewport of a mobile browser navigates to a temporary page from a script. In a WebDriver BiDi session, the next script could run while the browser replaced the page. It then failed with `Cannot find context with specified id` or `execution contexts cleared`, for example on Android Chrome through Appium. The visual service setup or the screenshot after an orientation change failed. The measurement now waits until the browser shows the new page.
