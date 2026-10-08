---
"@wdio/visual-service": patch
---

fix: link the mismatch message of the visual matchers to a page that exists

When a visual matcher fails, its message links to the documentation. The old link (`https://webdriver.io/docs/api/visual-regression.html`) returned a 404. It now links to the FAQ entry "My visual tests fail with a difference, how can I update my baseline?".
