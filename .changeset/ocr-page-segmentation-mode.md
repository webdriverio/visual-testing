---
"@wdio/ocr-service": minor
---

feat: add the `pageSegmentationMode` option (alias `psm`) to set the Tesseract page segmentation mode

With the default page segmentation mode 3 (fully automatic), Tesseract often finds no text in a small haystack with one or two characters, for example a counter or a badge, and the command fails with "No text was found for the OCR". You can now set the page segmentation mode (Tesseract `--psm`) for the service and for each OCR command:

```ts
const counter = await browser.ocrGetText({ haystack: $('#counter'), pageSegmentationMode: 7 })
```

The value in the service options applies to all OCR commands, and a command value overrides it. Set the modes for short text (7, 8, 9, 10 and 13) on the command, for the small haystack: in the service options they also apply to OCR of the full page, which then returns wrong text and no error.

These modes also always return something: an empty haystack can return invented text, such as `oo`, and not the "No text was found" error. Do not use them to check that an element is empty.

`psm` is an alias with the name of the Tesseract option: `{ psm: 7 }` is the same as `{ pageSegmentationMode: 7 }`. When you set both with different values in the service options or in one command, you get an error.

The supported values are 3, 4, 5, 6, 7, 8, 9, 10, 11 and 13; for example 7 = one line, 8 = one word, 10 = one character. Other values throw an error. The default stays 3, so the results do not change when you do not set the option. It works with tesseract.js and with a system Tesseract, and the CLI asks for it in the advanced mode.

To find one character with `ocrGetElementPositionByText()`, `ocrClickOnText()`, `ocrSetValue()` or `ocrWaitForTextDisplayed()`, also set `fuzzyFindOptions: { minMatchCharLength: 1 }`.
