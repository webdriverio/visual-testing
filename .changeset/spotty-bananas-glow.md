---
"@wdio/ocr-service": minor
---

\- improve typing for executor (as previously done in webdriverio package)

\- For both ocr-service and visual-service, the functions are now first add to the browser object and then to each instances to avoid having the loop for each instance in the command of a single instance (function with the loop no longer call itself like in the issue 657 and are now correctly declared to the correct element to fix issue 983)

\- Update the clean script for visual-reporter to work with Windows