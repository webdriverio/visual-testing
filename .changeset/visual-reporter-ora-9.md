---
"@wdio/visual-reporter": patch
---

chore: upgrade `ora` to 9 for the CLI spinners

`ora` 9 needs Node.js 20 or newer, which fits the reporter's declared Node.js requirement. The spinners of the `wdio-visual-reporter` CLI work the same.
