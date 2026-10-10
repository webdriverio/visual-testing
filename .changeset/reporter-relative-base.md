---
"@wdio/visual-reporter": patch
---

fix: open the report from any folder of a static host, for example an AWS S3 bucket

The report used absolute paths (`/assets/...`, `/static/report/output.json`) and a router that only matched the root URL, so it only worked at the root of a web server, opened as a folder (`/`). On S3 (`/reports/run-1/index.html`), in a sub-folder or with `index.html` in the URL, the page showed "404 Not Found". The report now uses relative paths and works in any folder, also with a query string. Fixes #985.
