---
"@wdio/visual-service": patch
"@wdio/image-comparison-core": patch
---

Fix `clearRuntimeFolder` clearing the actual and diff folders after each spec/feature execution instead of once before all workers start. This caused only the last spec's visual data to be present in the output when running multiple specs.

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
