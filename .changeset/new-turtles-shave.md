---
"@wdio/ocr-service": patch
---

# 🐛 Fix ERR_BUFFER_OUT_OF_BOUNDS for multiremote

Functions in utils such as `getData.ts` used the global `browser`, but this is not browser is not the browser making for example the `ocrClick` function call when the we are running in the multiremote context. This could lead to `ERR_BUFFER_OUT_OF_BOUNDS` error. This release fixes that error.

# Committers: 1

-   Chanatan Charnkijtawarush ([@ccharnkij](https://github.com/ccharnkij))
