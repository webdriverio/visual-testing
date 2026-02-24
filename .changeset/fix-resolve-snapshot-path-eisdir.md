---
"@wdio/visual-service": patch
---

Fix `EISDIR` error when using `resolveSnapshotPath` with the visual service. The service now uses `dirname()` of the resolved path as the baseline folder, preventing it from creating a directory at a path that `expect-webdriverio`'s snapshot service expects to be a file. Fixes #984.

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

