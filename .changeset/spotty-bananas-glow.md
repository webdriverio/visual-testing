---
"@wdio/ocr-service": minor
---

\- No more distinction between multiremote and single remote during the addCommand step

\- Inside browser command, the OCR functions are called directly with secured context instead of calling the browser function itself (to avoir loop from issue 657)

\- Inside browser command, the OCR functions are called only for the concerned instance instead of all existing instances from the capabilities (similar than  the issue 983)