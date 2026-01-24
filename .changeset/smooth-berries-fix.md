---
"@wdio/image-comparison-core": patch
"@wdio/visual-service": patch
---

## #1111 Respect saveAboveTolerance when deciding to save actual images when alwaysSaveActualImage is false.

When `alwaysSaveActualImage` is `false`, the actual image is no longer written to disk if the mismatch is below the configured tolerance, avoiding extra actuals when the comparison still passes.

# Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))
