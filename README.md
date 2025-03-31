# WebdriverIO Visual Testing 🔎 [![tests](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml/badge.svg)](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml) [![Build Status](https://app.eu-central-1.saucelabs.com/buildstatus/wdio-image-comparison-service)](https://app.eu-central-1.saucelabs.com/u/wdio-image-comparison-service)

For documentation on visual testing with WebdriverIO, please refer to the [docs](https://webdriver.io/docs/visual-testing). This project contains all relevant modules for running visual tests with WebdriverIO. Within the `./packages` directory you will find:

-   `@wdio/visual-testing`: the WebdriverIO service for integrating visual testing
-   `webdriver-image-comparison`: An image compare module that can be used for different NodeJS Test automation frameworks that support the WebDriver protocol

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
npm run test.local.desktop.storybook.localhost -- --spec='tests/specs/storybook-interaction/*.ts'
```

The Storybook runner will first automatically scan your Storybook instance and then add your tests to the stories that need to be compared. If you don't want the components that you use for interaction testing to be compared twice, you can add a filter to remove the "default" stories from the scan by providing the [`--skipStories`](#--skipstories) filter. This would look like this:

```sh
npm run test.local.desktop.storybook.localhost -- --skipStories="/example-page.*/gm" --spec='tests/specs/storybook-interaction/*.ts'
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

### Updating the packages

You can update the packages with a simple CLI tool. Make sure you've installed all dependencies, you can then run

```sh
pnpm update.packages
```

This will trigger a CLI that will ask you the following questions

```logs
==========================
🤖 Package update Wizard 🧙
==========================

? Which version target would you like to update to? (Minor|Latest)
? Do you want to update the package.json files? (Y/n)
? Do you want to remove all "node_modules" and reinstall dependencies? (Y/n)
? Would you like reinstall the dependencies? (Y/n)
```

This will result in the following logs

<details>
    <summary>Open to see an example of the logs</summary>
```logs
==========================
🤖 Package update Wizard 🧙
==========================

? Which version target would you like to update to? Minor
? Do you want to update the package.json files? yes
Updating root 'package.json' for minor updates...
Updating packages for minor updates in /Users/wswebcreation/Git/wdio/visual-testing...
Using pnpm
Upgrading /Users/wswebcreation/Git/wdio/visual-testing/package.json
[====================] 38/38 100%

@typescript-eslint/eslint-plugin ^8.7.0 → ^8.8.0
@typescript-eslint/parser ^8.7.0 → ^8.8.0
@typescript-eslint/utils ^8.7.0 → ^8.8.0
@vitest/coverage-v8 ^2.1.1 → ^2.1.2
vitest ^2.1.1 → ^2.1.2

Run pnpm install to install new versions.
Updating packages for minor updates in /Users/wswebcreation/Git/wdio/visual-testing/packages/ocr-service...
Using pnpm
Upgrading /Users/wswebcreation/Git/wdio/visual-testing/packages/ocr-service/package.json
[====================] 11/11 100%

All dependencies match the minor package versions :)
Updating packages for minor updates in /Users/wswebcreation/Git/wdio/visual-testing/packages/visual-reporter...
Using pnpm
Upgrading /Users/wswebcreation/Git/wdio/visual-testing/packages/visual-reporter/package.json
[====================] 11/11 100%

eslint-config-next 14.2.13 → 14.2.14
next 14.2.13 → 14.2.14

Run pnpm install to install new versions.
Updating packages for minor updates in /Users/wswebcreation/Git/wdio/visual-testing/packages/visual-service...
Using pnpm
Upgrading /Users/wswebcreation/Git/wdio/visual-testing/packages/visual-service/package.json
[====================] 5/5 100%

All dependencies match the minor package versions :)
Updating packages for minor updates in /Users/wswebcreation/Git/wdio/visual-testing/packages/webdriver-image-comparison...
Using pnpm
Upgrading /Users/wswebcreation/Git/wdio/visual-testing/packages/webdriver-image-comparison/package.json
[====================] 8/8 100%

All dependencies match the minor package versions :)
? Do you want to remove all "node_modules" and reinstall dependencies? yes
Removing root dependencies in /Users/wswebcreation/Git/wdio/visual-testing...
Removing dependencies in ocr-service...
Removing dependencies in visual-reporter...
Removing dependencies in visual-service...
Removing dependencies in webdriver-image-comparison...
? Would you like reinstall the dependencies? yes
Installing dependencies in /Users/wswebcreation/Git/wdio/visual-testing...

> @wdio/visual-testing-monorepo@ pnpm.install.workaround /Users/wswebcreation/Git/wdio/visual-testing
> pnpm install --shamefully-hoist

Scope: all 5 workspace projects
Lockfile is up to date, resolution step is skipped
Packages: +1274
++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
Progress: resolved 1274, reused 1265, downloaded 0, added 1274, done

dependencies:

-   @wdio/ocr-service 2.0.0 <- packages/ocr-service
-   @wdio/visual-service 6.0.0 <- packages/visual-service

devDependencies:

-   @changesets/cli 2.27.8
-   @inquirer/prompts 5.5.0
-   @tsconfig/node20 20.1.4
-   @types/eslint 9.6.1
-   @types/jsdom 21.1.7
-   @types/node 20.16.4
-   @types/react 18.3.5
-   @types/react-dom 18.3.0
-   @types/xml2js 0.4.14
-   @typescript-eslint/eslint-plugin 8.8.0
-   @typescript-eslint/parser 8.8.0
-   @typescript-eslint/utils 8.8.0
-   @vitest/coverage-v8 2.1.2
-   @wdio/appium-service 9.1.2
-   @wdio/cli 9.1.2
-   @wdio/globals 9.1.2
-   @wdio/local-runner 9.1.2
-   @wdio/mocha-framework 9.1.2
-   @wdio/sauce-service 9.1.2
-   @wdio/shared-store-service 9.1.2
-   @wdio/spec-reporter 9.1.2
-   @wdio/types 9.1.2
-   eslint 9.11.1
-   eslint-plugin-import 2.30.0
-   eslint-plugin-unicorn 55.0.0
-   eslint-plugin-wdio 9.0.8
-   husky 9.1.6
-   jsdom 25.0.1
-   npm-run-all2 6.2.3
-   release-it 17.6.0
-   rimraf 6.0.1
-   saucelabs 8.0.0
-   ts-node 10.9.2
-   typescript 5.6.2
-   vitest 2.1.2
-   webdriverio 9.1.2

. prepare$ husky
└─ Done in 204ms
Done in 9.5s
All packages updated!

````

</details>
### Questions

Please join our [Discord](https://discord.webdriver.io) Server if you have any questions or issues contributing to this project. Catch us contributors in the `🙏-contributing` channel.

### Issues

If you have questions, bugs or feature requests, please file an issue. Before submitting an issue, please search the issue archive to help reduce duplicates, and read the [FAQ](https://webdriver.io/docs/visual-testing/faq/).

If you can't find it there you can submit an issue where you can submit:

-   🐛**Bug report**: Create a report to help us improve
-   📖**Documentation**: Suggest improvements or report missing/unclear documentation.
-   💡**Feature request**: Suggest an idea for this module.
-   💬**Question**: Ask questions.

### Development Workflow

To create a PR for this project and start contributing follow this step-by-step guide:

-   Fork the project.
-   Clone the project somewhere on your computer

    ```sh
    $ git clone https://github.com/webdriverio/visual-testing.git
    ```

-   Go to the directory and setup the project

    ```sh
    $ cd visual-testing
    $ corepack enable
    $ pnpm pnpm.install.workaround
    ```

-   Run the watch mode that will automatically transpile the code

    ```sh
    $ pnpm watch
    ```

    to build the project, run:

    ```sh
    $ pnpm build
    ```

-   Ensure that your changes don't break any tests, run:

    ```sh
    $ pnpm test
    ```

This project uses [changesets](https://github.com/changesets/changesets) to automatically create changelogs and releases.

### Testing

Several tests need to be executed to be able to test the module. When adding a PR all tests must at least pass the local tests. Each PR is automatically tested against Sauce Labs, see [our GitHub Actions pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml). Before approving a PR the core contributors will test the PR against emulators/simulators / real devices.

#### Local Testing

First, a local baseline needs to be created. This can be done with:

```sh
// With the webdriver protocol
$ npm run test.local.init
````

This command will create a folder called `localBaseline` that will hold all the baseline images.

Then run:

```sh
// With the webdriver protocol
npm run test.local.desktop
```

This will run all tests on a local machine on Chrome.

#### Local Storybook Runner Testing (Beta)

First, a local baseline needs to be created. This can be done with:

```sh
npm run test.local.desktop.storybook
```

This will Storybook tests with Chrome in headless mode against a Demo Storybook repo located at https://govuk-react.github.io/govuk-react/.

To run the tests with more browsers you can run

```sh
npm run test.local.desktop.storybook -- --browsers=chrome,firefox,edge,safari
```

> [!NOTE]
> Make sure you have the browsers you want to run on installed on your local machine

#### CI testing with Sauce Labs (not needed for a PR)

The command below is used to test the build on GitHub Actions, it can only be used there and not for local development.

```
$ npm run test.saucelabs
```

It will test against a lot of configurations that can be found [here](./tests/configs/wdio.saucelabs.web.conf.ts).
All PRs are automatically checked against Sauce Labs.

## Releasing

To release a version of any of the packages listed above, do the following:

-   trigger the [release pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/release.yml)
-   a release PR is generated, have this be reviewed and approved by another WebdriverIO member
-   merge the PR
-   trigger the [release pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/release.yml) again
-   a new version should be released 🎉

## Credits

`@wdio/visual-testing` uses an open-source license from Sauce Labs.
