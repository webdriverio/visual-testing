---
"@wdio/ocr-service": patch
"@wdio/visual-reporter": patch
---

chore: upgrade `@inquirer/prompts` to 8 for the CLI wizards

`@inquirer/prompts` 8 is ESM only and needs Node.js `^22.13` or `>=23.5` (these packages already need 22.19 or newer). The wizards of the `ocr-service` and `wdio-visual-reporter` CLIs work the same; the prompt colors now come from Node.js `styleText`.
