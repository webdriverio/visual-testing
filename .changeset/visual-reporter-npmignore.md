---
"@wdio/visual-reporter": patch
---

fix: do not publish the route types that React Router generates

Since the move to React Router, the package also contained 2 generated type files (`.react-router/types/`), which only the type check of this repository uses. They are no longer published.
