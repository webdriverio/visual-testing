---
"@wdio/visual-service": minor
---

feat: the visual matchers can wait until the image matches, with the `wait` and `interval` options

`toMatchScreenSnapshot()`, `toMatchFullPageSnapshot()`, `toMatchElementSnapshot()` and `toMatchTabbablePageSnapshot()` accept `wait` (milliseconds, default `0`) and `interval` (milliseconds, default `100`), with the same meaning as in the other WebdriverIO matchers. With `wait`, the matcher checks again until the image matches, for example after an animation, or with `.not` until it does not match. Each attempt is a full check, and a failure message tells how often it checked. When a later attempt matches, the actual and diff images of the earlier failed attempts are removed (an actual image that the matching attempt saved again stays). When the page renders the element of `toMatchElementSnapshot()` again during the wait, the matcher finds the element again and checks it again. Without `wait`, nothing changes. Fixes #690.
