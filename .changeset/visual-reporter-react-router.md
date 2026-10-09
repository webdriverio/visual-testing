---
"@wdio/visual-reporter": patch
---

chore: rebuild the report UI with React Router 8, React 19 and Vite 8

The report UI moves from Remix 2 (end of life) to React Router 8 in framework mode, as a static single-page app, with React 19 and Vite 8. The report looks and works the same, and the CLI did not change.

The report still opens in the same browsers as before: Chrome 87+, Edge 88+, Firefox 78+ and Safari 14+. Vite 8 builds for newer browsers by default, so the reporter sets this list itself.
