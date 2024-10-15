---
"@wdio/visual-reporter": minor
---

# 🚀 New Features `@wdio/visual-reporter`

-   Created a new demo for developing the ` @wdio/visual-reporter`. Starting the dev-server automatically generates a new sample report project
-   Added a resize of the Canvas after resizing the browser screen
-   You can now close the overlay by pressing ESC
-   Made it more clear in the overlay when there are no changes

# 💅 Polish `@wdio/visual-reporter`

-   refactor of the assets generation to make it more robust for the demo and external collected files
-   reduce package/bundle size
-   updated to latest dependencies

# 🐛 Bugs fixed `@wdio/visual-reporter`

-   Prevent the browser from going back in history when you press the browser back button when an overlay is opened. Now the overlay is closed.
