---
"@wdio/ocr-service": minor
---

feat: add the `psm` option to set the Tesseract page segmentation mode

With the default page segmentation mode 3 (fully automatic), Tesseract often finds no text in a small haystack with one or two characters, for example a counter or a badge, and the command fails with "No text was found for the OCR". You can now set the page segmentation mode for the service and for each OCR command:

```ts
// wdio.conf.ts
services: [['ocr', { psm: 7 }]]

// a spec, the command value overrides the service value
const counter = await browser.ocrGetText({ haystack: $('#counter'), psm: 7 })
```

The supported values are 3, 4, 5, 6, 7, 8, 9, 10, 11 and 13; for example 7 = one line, 8 = one word, 10 = one character. Other values throw an error. The default stays 3, so the results do not change when you do not set `psm`. The `psm` option works with tesseract.js and with a system Tesseract, and the CLI asks for it in the advanced mode.

To find one character with `ocrGetElementPositionByText()`, `ocrClickOnText()`, `ocrSetValue()` or `ocrWaitForTextDisplayed()`, also set `fuzzyFindOptions: { minMatchCharLength: 1 }`.
