---
"webdriver-image-comparison": patch
"@wdio/visual-service": patch
---

Optimize Mobile and Emulated device support

## 🐛 Bugfixes

### #969 Fix layer injection on mobile devices

On some devices the layer injection, to determine the exact position of the webview, was failing. It exceeded the appium timeout and returned an error like

```logs
[1] [0-0] 2025-05-23T08:04:11.788Z INFO webdriver: COMMAND getUrl()
[1] [0-0] 2025-05-23T08:04:11.789Z INFO webdriver: [GET] https://hub-cloud.browserstack.com/wd/hub/session/xxxxx/url
[1] [0-0] 2025-05-23T08:04:12.036Z INFO webdriver: RESULT about:blank
[1] [0-0] 2025-05-23T08:04:12.038Z INFO webdriver: COMMAND navigateTo("data:text/html;base64,CiAgICAgICAgPG .... LONG LIST OF CHARACTERS=")
[1] [0-0] 2025-05-23T08:04:12.038Z INFO webdriver: [POST] https://hub-cloud.browserstack.com/wd/hub/session/xxxx/url
[1] [0-0] 2025-05-23T08:04:12.038Z INFO webdriver: DATA {
[1] [0-0]   url: 'data:text/html;base64,CiAgICAgICAgPGh0bWw.... LONG LIST OF CHARACTERS='
[1] [0-0] }
[1] [0-0] 2025-05-23T08:05:42.132Z ERROR @wdio/utils:shim: Error: WebDriverError: The operation was aborted due to timeout when running "url" with method "POST" and args "{"url":"data:text/html;base64,CiAgICAgICAgPGh0b.... LONG LIST OF CHARACTERS="}"
[1] [0-0]     at FetchRequest._libRequest (file:///xxxxxxx/node_modules/webdriver/build/node.js:1836:13)
[1] [0-0] 2025-05-23T08:05:42.132Z DEBUG @wdio/utils:shim: Finished to run "before" hook in 91147ms
[1] [0-0]     at process.processTicksAndRejections (node:internal/process/task_queues:95:5)
[1] [0-0]     at async FetchRequest._request (file:///C:/xxxxxx/node_modules/webdriver/build/node.js:1846:20)
[1] [0-0]     at Browser.wrapCommandFn (c:/Projects/xxxxxx/node_modules/@wdio/utils/build/index.js:907:23)
[1] [0-0]     at Browser.url (c:/Projects/xxxxxxx/node_modules/webdriverio/build/node.js:5682:3)
[1] [0-0]     at Browser.wrapCommandFn (c:/Projects/xxxxxx/node_modules/@wdio/utils/build/index.js:907:23)
[1] [0-0]     at async loadBase64Html (file:///C:/Projects/xxxxxx/node_modules/webdriver-image-comparison/dist/helpers/utils.js:377:5)
[1] [0-0]     at async getMobileViewPortPosition (file:///C:/Projects/xxxxxx/node_modules/webdriver-image-comparison/dist/helpers/utils.js:417:9)
[1] [0-0]     at async getMobileInstanceData (file:///C:/Projects/xxxxxx/node_modules/@wdio/visual-service/dist/utils.js:58:28)
[1] [0-0]     at async getInstanceData (file:///C:/Projects/xxxxxxx/node_modules/@wdio/visual-service/dist/utils.js:189:77)
[1] [0-0] 2025-05-23T08:05:42.144Z INFO @wdio/browserstack-service: Update job with sessionId xxxxx
```

This was caused by the `await url(`data:text/html;base64,${base64Html}`)` that injected the layer. Some browsers couldn't handle the `data:text/html;base64`.

We now fixed that with a different injection. It was tested on Android/iOS and on Sims/Emus/Real Devices and it worked

### Improve determining if a device is emulated

In a previous release we added a function to determine if a device was emulated. This resulted in incorrect screen sizes that were used for the files names for devices. This caused or failing baselines, or new files to be created because the screen sizes were not available
We now improved the check and the correct screen sizes are added again to the file names and made sure that the previous generated base line could be used again.

## Committers: 1

-   Wim Selles ([@wswebcreation](https://github.com/wswebcreation))