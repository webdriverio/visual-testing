---
"webdriver-image-comparison": minor
"@wdio/visual-reporter": minor
"@wdio/visual-service": minor
"@wdio/ocr-service": patch
---

# Fix [495](https://github.com/webdriverio/visual-testing/issues/495): module system issue when using with vite and storybook

This fix only allows `runner` to be the `local` one, if not, it will throw this error

```logs
pnpm test.local.desktop.storybook                                                                                                                                 ─╯

> @wdio/visual-testing-monorepo@ test.local.desktop.storybook /Users/wswebcreation/Git/wdio/visual-testing
> wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --numShards=10 --url=https://govuk-react.github.io/govuk-react/ --skipStories="/.*(loading-box|spinner).*/"


Execution of 0 workers started at 2024-09-22T05:50:20.875Z

SevereServiceError in "onPrepare"
SevereServiceError:
A service failed in the 'onPrepare' hook
SevereServiceError:

Running `@wdio/visual-service` is only supported in `local` mode.


    at VisualLauncher.onPrepare (file:///Users/wswebcreation/Git/wdio/visual-testing/packages/visual-service/dist/storybook/launcher.js:22:19)
    at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1209:32
    at Array.map (<anonymous>)
    at runServiceHook (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1206:31)
    at Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:13)
    at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16)



Stopping runner...
    at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1227:29
    at async Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:7)
    at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16)
HookError [SevereServiceError]:
A service failed in the 'onPrepare' hook
SevereServiceError:

Running `@wdio/visual-service` is only supported in `local` mode.


    at VisualLauncher.onPrepare (file:///Users/wswebcreation/Git/wdio/visual-testing/packages/visual-service/dist/storybook/launcher.js:22:19)
    at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1209:32
    at Array.map (<anonymous>)
    at runServiceHook (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1206:31)
    at Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:13)
    at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16)



Stopping runner...
    at file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:1227:29
    at async Launcher.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:2193:7)
    at async Module.run (file:///Users/wswebcreation/Git/wdio/visual-testing/node_modules/.pnpm/@wdio+cli@9.0.7/node_modules/@wdio/cli/build/index.js:3218:16) {
  origin: 'onPrepare'
}
 ELIFECYCLE  Command failed with exit code 1.
```

# Fix [522](https://github.com/webdriverio/visual-testing/issues/522): visual-reporter logs an error when there is no diff file

The output contained a `diffFolderPath` when no diff was present. This resulted in an error in the logs which is fixed with this PR

# Fix [524](https://github.com/webdriverio/visual-testing/issues/524): Highlights are shown after re-render

When a diff is highlighted and the page was re-rendered it also showed the highlighted box again. This was very confusing and annoying

# 💅 New Feature: Add ignore boxes on the canvas

If ignore boxes are used then the canvas will also show them
<img width="1847" alt="image" src="https://github.com/user-attachments/assets/45d34d53-becc-4652-8f9b-a259240c2589">

# 💅 New Feature: Add hover effects on the diff and ignore boxes

When you now hover over a diff or ignore area you will now see that the box will be highlighted and has a text above it

**Diff area**
<img width="436" alt="image" src="https://github.com/user-attachments/assets/34728d87-8981-47c8-8f91-5c3d19431b27">

**Ignore area**
<img width="495" alt="image" src="https://github.com/user-attachments/assets/c8df6edc-ab9e-46e6-a09e-7d89d53b4a37">

# 💅 New Feature: Remove diff image before comparing

This solves the issue [425](https://github.com/webdriverio/visual-testing/issues/425) of removing a diff image from the diff folder for success. We now remove the "previous" diff image before we execute the compare so we also have the latest, or we now have a diff image after a retry where the first run failed and produced an image and a new successful run.

# 💅 Update dependencies

We've update all dependencies.
