---
"@wdio/ocr-service": patch
"@wdio/visual-reporter": patch
---

chore: upgrade `@inquirer/prompts` to 8 for the CLI wizards

`@inquirer/prompts` 8.7.3 is ESM only and needs Node.js `^20.17.0`, `^22.13.0` or `>=23.5.0`. For `@wdio/ocr-service` this changes nothing, because WebdriverIO 10 already needs Node.js 22.19 or newer. `@wdio/visual-reporter` declares Node.js `>=20.0.0`: its CLI wizard now needs Node.js `^20.17.0`, `^22.13.0` or `>=23.5.0`. The wizards work the same; the prompt colors now come from Node.js `styleText`.
