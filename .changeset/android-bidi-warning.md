---
"@wdio/visual-service": patch
---

feat: warn when an Android browser session in WebDriver BiDi cannot run scripts

WebdriverIO v10 starts a WebDriver BiDi session by default, but the Appium UiAutomator2 driver does not support the BiDi commands that the visual service uses, so every check command and visual matcher fails with an error that does not tell what to do (#1232). At the start of an Android browser session in BiDi, the service now tries one small script. If it fails, the service logs one warning: set `'wdio:enforceWebDriverClassic': true` in the capabilities. The warning stops by itself when the driver supports these commands.
