---
"@wdio/ocr-service": patch
"@wdio/visual-reporter": patch
---

chore: upgrade `@inquirer/prompts` to 8 for the CLI wizards

`@inquirer/prompts` 8.7.3 is ESM only and needs Node.js `^20.17.0`, `^22.13.0` or `>=23.5.0`. Both packages now need Node.js 22.19 or newer (like WebdriverIO 10), so this changes nothing for users. The wizards work the same; the prompt colors now come from Node.js `styleText`.
