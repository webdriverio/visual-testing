---
'@wdio/ocr-service': patch
---

Remove the `node-tesseract-ocr` dependency from `@wdio/ocr-service`. It carried an unpatched critical advisory (GHSA-8j44-735h-w4w2, OS command injection in `recognize()`) and has had no release since 2022, so every project that installed the OCR service got one `npm audit` finding it could not clear.

The service now runs the system `tesseract` binary itself through `child_process.execFile` with an argument array, so the screenshot path and the options never pass through a shell. The command that is run is the same as before (`tesseract <file> stdout -l <lang> --oem 1 --psm 3 alto`), so the OCR output does not change. `isSystemTesseractAvailable()` uses `execFileSync` for the same reason.
