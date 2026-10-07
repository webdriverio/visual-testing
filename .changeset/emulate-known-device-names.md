---
"@wdio/visual-service": patch
---

fix: call `emulate('device')` only for a device that WebdriverIO knows

With the `mobileEmulation.deviceName` capability of Chrome or Edge, the visual service calls `browser.emulate('device', deviceName)` only when the name is in the device list of WebdriverIO (`deviceDescriptorsSource`). For another name (Chrome knows more devices), it now logs this and sets the viewport of the device that the browser emulates, without a failed `emulate('device')` call first. The result is the same as before.
