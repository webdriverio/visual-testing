---
"@wdio/ocr-service": patch
"@wdio/visual-reporter": patch
---

chore: upgrade `@inquirer/prompts` to 8 for the CLI wizards

`@inquirer/prompts` 8 is ESM only and needs Node.js `^20.12`, `^21.7`, `^22.13` or `>=23.5`. For `@wdio/ocr-service` this changes nothing, because WebdriverIO 10 already needs Node.js 22.19 or newer. `@wdio/visual-reporter` declares Node.js `>=20.0.0`: its CLI wizard now needs at least Node.js 20.12 (or 21.7, 22.13). The wizards work the same; the prompt colors now come from Node.js `styleText`.
