---
"@wdio/visual-reporter": minor
---

chore: rebuild the report UI with React Router 8, React 19 and Vite 8

The report UI moves from Remix 2 (end of life) to React Router 8 in framework mode, as a static single-page app, with React 19 and Vite 8. The report looks and works the same, and the CLI did not change.

Vite 8 builds for its default target "baseline widely available": the report now needs Chrome or Edge 111+, Firefox 114+ or Safari 16.4+ (before, with Vite 5: Chrome 87+, Edge 88+, Firefox 78+, Safari 14+).
