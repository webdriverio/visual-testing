---
"@wdio/visual-service": patch
---

fix: add the visual matchers with `expect.extend()` also with Jasmine

From `@wdio/jasmine-framework` 10.0.2 the Jasmine `expect` has an `extend()` (webdriverio/webdriverio#15947), so the service now adds `toMatchScreenSnapshot()`, `toMatchFullPageSnapshot()`, `toMatchElementSnapshot()` and `toMatchTabbablePageSnapshot()` with it, as with Mocha. With `@wdio/jasmine-framework` 10.0.0 and 10.0.1, which have no `extend()` (webdriverio/webdriverio#15913), the service still adds them to Jasmine itself.
