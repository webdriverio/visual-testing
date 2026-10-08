---
"@wdio/image-comparison-core": patch
---

fix: the published type declarations import other declarations with relative paths

Five type declaration files imported other files with paths like `src/methods/images.interfaces.js`. Those paths only worked inside this repository, so in a user's project TypeScript could not resolve them, and types such as `TestContext`, `CompareData` and `ElementIgnore` became `any` (or caused `Cannot find module 'src/…'` errors without `skipLibCheck`). The imports are now relative.
