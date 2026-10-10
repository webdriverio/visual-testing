# @wdio/visual-reporter

## 0.5.0

### Minor Changes

- 5557e9e: chore: declare Node.js `>=22.19.0`, the same as WebdriverIO 10
  
  All packages now declare `"engines": { "node": ">=22.19.0" }`, like every package of WebdriverIO 10.
  
  - `@wdio/image-comparison-core`, `@wdio/visual-service` and `@wdio/ocr-service` did not declare a Node.js version, but they already needed 22.19 or newer through WebdriverIO 10.
  - `@wdio/visual-reporter` declared `>=20.0.0`. Node.js 20 is end-of-life, and the reporter CLI is used together with WebdriverIO 10, so it now also needs Node.js 22.19 or newer.

### Patch Changes

- 4c63e9a: chore: upgrade `@inquirer/prompts` to 8 for the CLI wizards
  
  `@inquirer/prompts` 8.7.3 is ESM only and needs Node.js `^20.17.0`, `^22.13.0` or `>=23.5.0`. Both packages now need Node.js 22.19 or newer (like WebdriverIO 10), so this changes nothing for users. The wizards work the same; the prompt colors now come from Node.js `styleText`.
- fd988ee: fix: open the report from any folder of a static host, for example an AWS S3 bucket
  
  The report used absolute paths (`/assets/...`, `/static/report/output.json`) and a router that only matched the root URL, so it only worked at the root of a web server, opened as a folder (`/`). On S3 (`/reports/run-1/index.html`), in a sub-folder or with `index.html` in the URL, the page showed "404 Not Found". The report now uses relative paths and works in any folder, also with a query string. Fixes #985.
- a9d45d3: fix: do not publish the route types that React Router generates
  
  Since the move to React Router, the package also contained 2 generated type files (`.react-router/types/`), which only the type check of this repository uses. They are no longer published.
- 0a82c74: chore: upgrade `ora` to 9 for the CLI spinners
  
  `ora` 9 needs Node.js 20 or newer, which fits the reporter's declared Node.js requirement. The spinners of the `wdio-visual-reporter` CLI work the same.
- 6764aef: chore: rebuild the report UI with React Router 8, React 19 and Vite 8
  
  The report UI moves from Remix 2 (end of life) to React Router 8 in framework mode, as a static single-page app, with React 19 and Vite 8. The report looks and works the same, and the CLI did not change.
  
  The report still opens in the same browsers as before: Chrome 87+, Edge 88+, Firefox 78+ and Safari 14+. Vite 8 builds for newer browsers by default, so the reporter sets this list itself.

## 0.4.15

### Patch Changes

- b194642: chore: dependency updates

  Updated dependencies to their latest compatible versions:

  - `@wdio/visual-service`: `expect-webdriverio` to `^5.7.0`
  - `@wdio/visual-reporter`: `sharp` to `^0.35.3`
  - Dev tooling: `@typescript-eslint/*` to `^8.63.0`, `vitest` to `^3.2.7`, `eslint` to `^9.39.5`, plus minor bumps for `postcss`, `react-icons`, and `isbot` in the reporter package

  No functional or API changes.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.14

### Patch Changes

- 6cd5742: ### Dependency updates

  Updated dependencies across all packages to their latest compatible versions. This includes the WebdriverIO toolchain (`webdriverio`, `@wdio/*`) to `9.29.1`, the TypeScript ESLint plugins to `8.62.0`, Vitest to `3.2.6`, and various other packages such as `sharp`, `@remix-run/*`, `fuse.js` and `expect-webdriverio`. There are no functional or API changes.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.13

### Patch Changes

- db33fa7: #### `@wdio/image-comparison-core` and `@wdio/ocr-service` Security: update jimp (CVE in `file-type` transitive dep)

  Bumped `jimp` to the latest version to resolve a reported vulnerability in its `file-type` transitive dependency (see [#1130](https://github.com/webdriverio/visual-testing/issues/1130), raised by [@denis-sokolov](https://github.com/denis-sokolov), thank you!).

  **Actual impact on these packages**
  `file-type` is used by `@jimp/core` solely to detect image MIME types when reading a buffer. In both `@wdio/image-comparison-core` and `@wdio/ocr-service`, every image passed to jimp originates from either WebDriver screenshots (browser-controlled base64 data) or local files written by the framework itself. There is no code path where untrusted external input is fed directly into jimp, which removes the exploitability that the CVE describes.

  That said, the reputational and compliance risk was real, security scanners flag the package as vulnerable, enterprise users hit audit failures, and some organisations block installation of packages with known CVEs. The update addresses all of that.

  #### `@wdio/visual-reporter` and `@wdio/visual-service`

  Updated internal dependencies to pick up the jimp bump in `@wdio/image-comparison-core`.

  ### Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.12

### Patch Changes

- e4e5b5c: # 🐛 Bugfixes

  ## #1085 autoSaveBaseline collides with the new alwaysSaveActualImage flag

  When `autoSaveBaseline` is `true` and `alwaysSaveActualImage` is `false`, actual images were still saved. This patch should fix that

  # Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.11

### Patch Changes

- 3dbfa0e: fix: [990](#990)mclean script from package.json is now working on Windows

  ## Committers: 1

  - P-Courteille ([@P-Courteille](https://github.com/P-Courteille))

## 0.4.10

### Patch Changes

- 42956e4: 🔧 Other

  - 🆙 Updated dependencies

  ***

  ## Committers: 1

  - Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.9

### Patch Changes

- 8aaaf98: fix script for GH-pages

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.8

### Patch Changes

- 6fb85fc: Fix Windows support

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.7

### Patch Changes

- 09dbc2d: update deps

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.4.6

### Patch Changes

- 69d25fe: Multiple fixes:

  - update deps

## 0.4.5

### Patch Changes

- 2d033e8: update deps

## 0.4.4

### Patch Changes

- 4a4adf1: update deps

## 0.4.3

### Patch Changes

- c740c91: fix paths for cli

## 0.4.2

### Patch Changes

- a34dd5d: Update of deps

## 0.4.1

### Patch Changes

- 6fb41ff: Fix cli command

## 0.4.0

### Minor Changes

- 267c513: # 🚀 New Features `@wdio/visual-reporter`

  - Created a new demo for developing the ` @wdio/visual-reporter`. Starting the dev-server automatically generates a new sample report project
  - Added a resize of the Canvas after resizing the browser screen
  - You can now close the overlay by pressing ESC
  - Made it more clear in the overlay when there are no changes

  # 💅 Polish `@wdio/visual-reporter`

  - refactor of the assets generation to make it more robust for the demo and external collected files
  - reduce package/bundle size
  - updated to latest dependencies

  # 🐛 Bugs fixed `@wdio/visual-reporter`

  - Prevent the browser from going back in history when you press the browser back button when an overlay is opened. Now the overlay is closed.

## 0.3.0

### Minor Changes

- 786248e: Upgrade Jimp to the latest major

## 0.2.0

### Minor Changes

#### Fix [522](https://github.com/webdriverio/visual-testing/issues/522): visual-reporter logs an error when there is no diff file

The output contained a `diffFolderPath` when no diff was present. This resulted in an error in the logs which is fixed with this PR

#### Fix [524](https://github.com/webdriverio/visual-testing/issues/524): Highlights are shown after re-render

When a diff is highlighted and the page was re-rendered it also showed the highlighted box again. This was very confusing and annoying

#### 💅 New Feature: Add ignore boxes on the canvas

If ignore boxes are used then the canvas will also show them

<img width="1847" alt="image" src="https://github.com/user-attachments/assets/45d34d53-becc-4652-8f9b-a259240c2589">

#### 💅 New Feature: Add hover effects on the diff and ignore boxes

When you now hover over a diff or ignore area you will now see that the box will be highlighted and has a text above it

**Diff area**

<img width="436" alt="image" src="https://github.com/user-attachments/assets/34728d87-8981-47c8-8f91-5c3d19431b27">

**Ignore area**

<img width="495" alt="image" src="https://github.com/user-attachments/assets/c8df6edc-ab9e-46e6-a09e-7d89d53b4a37">

#### 💅 Update dependencies

We've update all dependencies.

### Committers: 1

- Wim Selles ([@wswebcreation](https://github.com/wswebcreation))

## 0.1.7

### NEW PACKAGE

This is the first release of the new `@wdio/visual-reporter` module. With this module, in combination with the `@wdio/visual-service` module, you can now create beautiful HTML reports where you can view the results.

To make use of this utility, you need to have the 'output.json' file generated by the Visual Testing service. This file is only generated when you have the following in your configuration:

```ts
export const config = {
    // ...
    services: [
        [
            // Also installed as a dependency
            "visual-regression",
            {
                createJsonReportFiles: true,
            },
        ],
    ],
    },
}
```

For more information, please refer to the WebdriverIO Visual Testing [documentation](https://webdriver.io/docs/visual-testing).

#### Installation

The easiest way is to keep `@wdio/visual-reporter` as a dev-dependency in your `package.json`, via:

```sh
npm install @wdio/visual-reporter --save-dev
```

##### The CLI

https://github.com/user-attachments/assets/eeb22692-928c-4734-a49b-0e22655d2a1d

##### The Visual Reporter

https://github.com/user-attachments/assets/9cdfec36-e1ff-4b48-a842-23f3f7d5768e
