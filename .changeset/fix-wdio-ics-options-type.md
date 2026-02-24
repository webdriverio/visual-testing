---
"@wdio/visual-service": patch
---

Fix incomplete `wdio-ics:options` type augmentation on `WebdriverIO.Capabilities`. The global type declaration now uses the `WdioIcsOptions` interface directly, ensuring all supported properties (`logName`, `name`) are available to TypeScript users in both standalone and multiremote configurations. Fixes #732.

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
