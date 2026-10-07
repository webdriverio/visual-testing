# WebdriverIO Visual Testing 🔎 [![checks](https://github.com/webdriverio/visual-testing/actions/workflows/checks.yml/badge.svg)](https://github.com/webdriverio/visual-testing/actions/workflows/checks.yml) [![Build Status](https://app.eu-central-1.saucelabs.com/buildstatus/wdio-image-comparison-service)](https://app.eu-central-1.saucelabs.com/u/wdio-image-comparison-service)

For documentation on visual testing with WebdriverIO, please refer to the [docs](https://webdriver.io/docs/visual-testing). This project contains all relevant modules for running visual tests with WebdriverIO. Within the `./packages` directory you will find:

-   `@wdio/visual-service`: the WebdriverIO service for integrating visual testing
-   `@wdio/image-comparison-core`: the core image comparison engine used by the service
-   `@wdio/ocr-service`: the WebdriverIO service for OCR-based testing
-   `@wdio/visual-reporter`: the HTML report generator for visual testing results

## Quick start

```sh
npm install --save-dev @wdio/visual-service
```

```js
// wdio.conf.js
export const config = {
    // ...
    services: [
        ['visual', {
            // optional, these are the defaults
            baselineFolder: './__snapshots__/', // next to the spec file
            screenshotPath: '.tmp/',            // actual and diff images
            autoSaveBaseline: true,             // save a missing baseline and let the test pass
        }],
    ],
}
```

```js
// test.spec.js
describe('Visual', () => {
    it('matches the baseline', async () => {
        await browser.url('https://webdriver.io')

        // Matchers: the second argument is the maximum mismatch percentage (default 0)
        await expect(browser).toMatchScreenSnapshot('homepage', 0.2)
        await expect(browser).toMatchFullPageSnapshot('fullPage', 0.2, {
            hideElements: [await $('.navbar')],
        })
        await expect($('.navbar__logo')).toMatchElementSnapshot('logo')

        // Methods: return the mismatch percentage
        expect(await browser.checkElement(await $('.navbar__logo'), 'logo')).toEqual(0)
    })
})
```

Run the tests with `--update-visual-baseline` to replace the baselines with the actual images.

### API

| Method | Matcher | Captures |
|---|---|---|
| `checkScreen(tag, options?)` | `toMatchScreenSnapshot(tag, expected?, options?)` | the viewport |
| `checkElement(element, tag, options?)` | `toMatchElementSnapshot(tag, expected?, options?)` | one element |
| `checkFullPageScreen(tag, options?)` | `toMatchFullPageSnapshot(tag, expected?, options?)` | the full page |
| `checkTabbablePage(tag, options?)` | `toMatchTabbablePageSnapshot(tag, expected?, options?)` | the full page with the tab order |

-   `check*` compares with the baseline and returns the mismatch percentage. `save*` (`saveScreen`, `saveElement`, `saveFullPageScreen`, `saveTabbablePage`) only saves the image.
-   `expected` is the maximum mismatch percentage (default `0`) or an asymmetric matcher, for example `expect.closeTo(0, 2)`.
-   Frequent method options: `hideElements` and `removeElements` (elements), `ignore` (elements or regions) and `blockOut` (regions) to not compare a part, `hideScrollBars`, `disableCSSAnimation`.

`@wdio/ocr-service` adds `ocrGetText`, `ocrClickOnText`, `ocrSetValue`, `ocrWaitForTextDisplayed` and `ocrGetElementPositionByText`.

All the options: [service options](https://webdriver.io/docs/visual-testing/service-options), [method options](https://webdriver.io/docs/visual-testing/method-options), [OCR service](https://webdriver.io/docs/ocr-testing/getting-started).

## Versions & Support

| Version | npm tag | Status | Supported until |
|---|---|---|---|
| **v11** — `@wdio/visual-service@11` / `@wdio/image-comparison-core@3` | `next` | 🚧 Prerelease, WebdriverIO v10 only | — |
| **v10** — `@wdio/visual-service@10` / `@wdio/image-comparison-core@2` | `latest` (`legacy-v10` after the v11 release) | 🛠️ Maintenance for WebdriverIO v9 users (fixes backported on request) | — |
| **v9** — `@wdio/visual-service@9` / `@wdio/image-comparison-core@1` | `legacy` | 🛠️ Maintenance (critical fixes only) | 12 months after the v10 release |

> [!IMPORTANT]
> **v10 replaces the image comparison engine** (resemble.js → [pixelmatch](https://github.com/mapbox/pixelmatch)). The public API is unchanged, but mismatch percentages differ slightly, so you need to **re-accept your baselines once** after upgrading.

### WebdriverIO compatibility

The versions in the table above are the versions of the visual testing packages, not of WebdriverIO. From version 10.2.0, `@wdio/visual-service` supports WebdriverIO v9 and WebdriverIO v10. From version 11, it supports only WebdriverIO v10.

| Package | WebdriverIO v9 (9.29.1 and later) | WebdriverIO v10 |
|---|---|---|
| `@wdio/visual-service` | v9 and v10 | 10.2.0 and later, v11 |
| `@wdio/ocr-service` | v2 | 2.3.0 and later, v3 |

> [!NOTE]
> WebdriverIO v10 needs Node.js 22.19 or later. WebdriverIO v9 needs Node.js 18.20 or later.

#### Upgrading to WebdriverIO v10

-   **Strict `$()`**: in WebdriverIO v10, `$()` throws a `StrictSelectorError` when the selector finds more than one element. This applies to elements in `ignore` and to `checkElement()` / `toMatchElementSnapshot()`. Use `$$()` to use all the elements, `$(selector, { strict: false })` to use the first one, or a more specific selector. `hideElements` and `removeElements` are not affected.
-   **Elements in a frame**: in a WebDriver BiDi session, an element screenshot of an element in a frame is not supported. With WebdriverIO v9 `switchFrame()`, the image is moved by the position of the frame. With WebdriverIO v10 `context.frame()`, the command fails. With WebDriver Classic (`'wdio:enforceWebDriverClassic': true`), it works with WebdriverIO v9 and v10. See [#1228](https://github.com/webdriverio/visual-testing/issues/1228).

### Staying on v9

v9 receives **critical bug and security fixes only** for **12 months** after the v10 release. Pin it with a semver range, which always resolves to the v9 line regardless of npm tags:

```sh
npm install @wdio/visual-service@^9
```

Once v9 maintenance releases are published, they are also available under the `legacy` tag:

```sh
npm install @wdio/visual-service@legacy
```

Installing without a version (`npm install @wdio/visual-service`) always gives you the latest **v10**.

### Upgrading from v9 to v10

1. Install the latest: `npm install @wdio/visual-service@latest`.
2. Re-run your suite once and re-accept the baselines so they are regenerated with the new engine.
3. No code changes are required — `checkScreen`, `checkElement`, `checkFullPageScreen` and the matchers keep the same signatures and `ignore` options.

When v9 reaches end of life it will be marked deprecated on npm.

## Storybook Runner (BETA)

<details>
  <summary>Click to find out more documentation about the Storybook Runner BETA</summary>

> Storybook Runner is still in BETA, the docs will later move to the [WebdriverIO](https://webdriver.io/docs/visual-testing) documentation pages.

This module now supports Storybook with a new Visual Runner. This runner automatically scans for a local/remote storybook instance and will create element screenshots of each component. This can be done by adding

```ts
export const config: WebdriverIO.Config = {
    // ...
    services: ["visual"],
    // ....
};
```

to your `services` and running `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook` through the command line.
It will use Chrome in headless mode as the default browser.

> [!NOTE]
>
> -   Most of the Visual Testing options will also work for the Storybook Runner, see the [WebdriverIO](https://webdriver.io/docs/visual-testing) documentation.
> -   The Storybook Runner will overwrite all your capabilities and can only run on the browsers that it supports, see [`--browsers`](#browsers).
> -   The Storybook Runner does not support an existing config that uses Multiremote capabilities and will throw an error.
> -   The Storybook Runner only supports Desktop Web, not Mobile Web.

### Storybook Runner Service Options

Service options can be provided like this

```ts
export const config: WebdriverIO.Config  = {
    // ...
    services: [
      [
        'visual',
        {
            // Some default options
            baselineFolder: join(process.cwd(), './__snapshots__/'),
            debug: true,
            // The storybook options, see cli options for the description
            storybook: {
                additionalSearchParams: new URLSearchParams({foo: 'bar', abc: 'def'}),
                clip: false,
                clipSelector: ''#some-id,
                numShards: 4,
                // `skipStories` can be a string ('example-button--secondary'),
                // an array (['example-button--secondary', 'example-button--small'])
                // or a regex which needs to be provided as as string ("/.*button.*/gm")
                skipStories: ['example-button--secondary', 'example-button--small'],
                url: 'https://www.bbc.co.uk/iplayer/storybook/',
                version: 6,
                // Optional - Allows overriding the baselines path. By default it will group the baselines by category and component (e.g. forms/input/baseline.png)
                getStoriesBaselinePath: (category, component) => `path__${category}__${component}`,
            },
        },
      ],
    ],
    // ....
}
```

### Storybook Runner CLI options

#### `--additionalSearchParams`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** ''
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --additionalSearchParams="foo=bar&abc=def"`

It will add additional search parameters to the Storybook URL.
See the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) documentation for more information. The string must be a valid URLSearchParams string.

> [!NOTE]
> The double quotes are needed to prevent the `&` from being interpreted as a command separator.
> For example with `--additionalSearchParams="foo=bar&abc=def"` it will generate the following Storybook URL for stories test: `http://storybook.url/iframe.html?id=story-id&foo=bar&abc=def`.

#### `--browsers`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** `chrome`, you can select from `chrome|firefox|edge|safari`
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --browsers=chrome,firefox,edge,safari`
-   **NOTE:** Only available through the CLI

It will use the provided browsers to take component screenshots

> [!NOTE]
> Make sure you have the browsers you want to run on installed on your local machine

#### `--clip`

-   **Type:** `boolean`
-   **Mandatory:** No
-   **Default:** `true`
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --clip=false`

When disabled it will create a viewport screenshot. When enabled it will create element screenshots based on the [`--clipSelector`](#clipselector) which will reduce the amount of whitespace around the component screenshot and reduce the screenshot size.

#### `--clipSelector`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** `#storybook-root > :first-child` for Storybook V7 and `#root > :first-child:not(script):not(style)` for Storybook V6, see also [`--version`](#version)
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --clipSelector="#some-id"`

This is the selector that will be used:

-   to select the element to take the screenshot of
-   for the element to wait to be visible before a screenshot is taken

#### `--devices`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** You can select from the [`deviceDescriptors.ts`](./packages/service/src/storybook/deviceDescriptors.ts)
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --devices="iPhone 14 Pro Max","Pixel 3 XL"`
-   **NOTE:** Only available through the CLI

It will use the provided devices that match the [`deviceDescriptors.ts`](./packages/service/src/storybook/deviceDescriptors.ts) to take component screenshots

> [!NOTE]
>
> -   If you miss a device config, then feel free to submit a [Feature request](https://github.com/webdriverio/visual-testing/issues/new?assignees=&labels=&projects=&template=--feature-request.md)
> -   This will only work with Chrome:
>     -   if you provide `--devices` then all Chrome instances will run in **Mobile Emulation** mode
>     -   if you also provide other browser then Chrome, like `--devices --browsers=firefox,safari,edge` it will automatically add Chrome in Mobile emulation mode
> -   The Storybook Runner will by default create element snapshots, if you want to see the complete Mobile Emulated screenshot then provide `--clip=false` through the command line
> -   The file name will for example look like `__snapshots__/example/button/desktop_chrome/example-button--large-local-chrome-iPhone-14-Pro-Max-430x932-dpr-3.png`
> -   **[SRC:](https://chromedriver.chromium.org/mobile-emulation#h.p_ID_167)** Testing a mobile website on a desktop using mobile emulation can be useful, but testers should be aware that there are many subtle differences such as:
>     -   entirely different GPU, which may lead to big performance changes;
>     -   mobile UI is not emulated (in particular, the hiding url bar affects page height);
>     -   disambiguation popup (where you select one of a few touch targets) is not supported;
>     -   many hardware APIs (for example, orientationchange event) are unavailable.

#### `--headless`

-   **Type:** `boolean`
-   **Mandatory:** No
-   **Default:** `true`
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --headless=false`
-   **NOTE:** Only available through the CLI

This will run the tests by default in headless mode (when the browser supports it) or can be disabled

#### `--numShards`

-   **Type:** `number`
-   **Mandatory:** No
-   **Default:** `true`
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --numShards=10`

This will be the number of parallel instances that will be used to run the stories. This will be limited by the `maxInstances` in your `wdio.conf`-file.

> [!IMPORTANT]
> When running in `headless`-mode then do not increase the number to more than 20 to prevent flakiness due to resource restrictions

#### `--skipStories`

-   **Type:** `string|regex`
-   **Mandatory:** No
-   **Default:** null
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --skipStories="/.*button.*/gm"`

This can be:

-   a string (`example-button--secondary,example-button--small`)
-   or a regex (`"/.*button.*/gm"`)

to skip certain stories. Use the `id` of the story that can be found in the URL of the story. For example, the `id` in this URL `http://localhost:6006/?path=/story/example-page--logged-out` is `example-page--logged-out`

#### `--url`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** `http://127.0.0.1:6006`
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --url="https://example.com"`

The URL where your Storybook instance is hosted.

#### `--version`

-   **Type:** `number`
-   **Mandatory:** No
-   **Default:** 7
-   **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --version=6`

This is the version of Storybook, it defaults to `7`. This is needed to know if the V6 [`clipSelector`](#clipselector) needs to be used.

### Storybook Interaction Testing

Storybook Interaction Testing allows you to interact with your component by creating custom scripts with WDIO commands to set a component into a certain state. For example, see the code snippet below:

```ts
import { browser, expect } from "@wdio/globals";

describe("Storybook Interaction", () => {
    it("should create screenshots for the logged in state when it logs out", async () => {
        const componentId = "example-page--logged-in";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
        await $("button=Log out").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
    });

    it("should create screenshots for the logged out state when it logs in", async () => {
        const componentId = "example-page--logged-out";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
        await $("button=Log in").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
    });
});
```

Two tests on two different components are executed. Each test first sets a state and then takes a screenshot. You will also notice that a new custom command has been introduced, which can be found [here](#new-custom-command).

The above spec file can be saved in a folder and added to the command line with the following command:

```sh
pnpm run test.local.desktop.storybook.localhost -- --spec='tests/specs/storybook-interaction/*.ts'
```

The Storybook runner will first automatically scan your Storybook instance and then add your tests to the stories that need to be compared. If you don't want the components that you use for interaction testing to be compared twice, you can add a filter to remove the "default" stories from the scan by providing the [`--skipStories`](#--skipstories) filter. This would look like this:

```sh
pnpm run test.local.desktop.storybook.localhost -- --skipStories="/example-page.*/gm" --spec='tests/specs/storybook-interaction/*.ts'
```

### New Custom Command

A new custom command called `browser.waitForStorybookComponentToBeLoaded({ id: 'componentId' })` will be added to the `browser/driver`-object that will automatically load the component and wait for it to be done, so you don't need to use the `browser.url('url.com')` method. It can be used like this

```ts
import { browser, expect } from "@wdio/globals";

describe("Storybook Interaction", () => {
    it("should create screenshots for the logged in state when it logs out", async () => {
        const componentId = "example-page--logged-in";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
        await $("button=Log out").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
    });

    it("should create screenshots for the logged out state when it logs in", async () => {
        const componentId = "example-page--logged-out";
        await browser.waitForStorybookComponentToBeLoaded({ id: componentId });

        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-out-state`
        );
        await $("button=Log in").click();
        await expect($("header")).toMatchElementSnapshot(
            `${componentId}-logged-in-state`
        );
    });
});
```

The options are:

#### `additionalSearchParams`

-   **Type:** [`URLSearchParams`](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams)
-   **Mandatory:** No
-   **Default:** `new URLSearchParams()`
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({
    additionalSearchParams: new URLSearchParams({ foo: "bar", abc: "def" }),
    id: "componentId",
});
```

This will add additional search parameters to the Storybook URL, in the example above the URL will be `http://storybook.url/iframe.html?id=story-id&foo=bar&abc=def`.
See the [URLSearchParams](https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams) documentation for more information.

#### `clipSelector`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** `#storybook-root > :first-child` for Storybook V7 and `#root > :first-child:not(script):not(style)` for Storybook V6
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({
    clipSelector: "#your-selector",
    id: "componentId",
});
```

This is the selector that will be used:

-   to select the element to take the screenshot of
-   for the element to wait to be visible before a screenshot is taken

#### `id`

-   **Type:** `string`
-   **Mandatory:** yes
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({ '#your-selector', id: 'componentId' })
```

Use the `id` of the story that can be found in the URL of the story. For example, the `id` in this URL `http://localhost:6006/?path=/story/example-page--logged-out` is `example-page--logged-out`

#### `timeout`

-   **Type:** `number`
-   **Mandatory:** No
-   **Default:** 1100 milliseconds
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({
    id: "componentId",
    timeout: 20000,
});
```

The max timeout we want to wait for a component to be visible after loading on the page

#### `url`

-   **Type:** `string`
-   **Mandatory:** No
-   **Default:** `http://127.0.0.1:6006`
-   **Example:**

```ts
await browser.waitForStorybookComponentToBeLoaded({
    id: "componentId",
    url: "https://your.url",
});
```

The URL where your Storybook instance is hosted.

</details>

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) to set up the project, run the tests and release the packages.

## Credits

`@wdio/visual-testing` uses an open-source license from [LambdaTest](https://www.lambdatest.com/) and [Sauce Labs](https://saucelabs.com/).
