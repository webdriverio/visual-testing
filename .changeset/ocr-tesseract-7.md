---
"@wdio/ocr-service": patch
---

chore: upgrade `tesseract.js` from 5 to 7

OCR with the built-in Tesseract (when no system Tesseract is installed) is about 15 % faster, and the memory leak of tesseract.js 5 (memory grew over time until a crash) is fixed. The found text and word positions are the same. Since tesseract.js 6 only the `text` output is on by default, so the service now asks for the `hocr` output, which it uses for the word positions.
