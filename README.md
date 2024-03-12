# WebdriverIO Visual Testing 🔎 [![tests](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml/badge.svg)](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml) [![Build Status](https://app.eu-central-1.saucelabs.com/buildstatus/wdio-image-comparison-service)](https://app.eu-central-1.saucelabs.com/u/wdio-image-comparison-service)

For documentation on visual testing with WebdriverIO, please refer to the [docs](https://webdriver.io/docs/visual-testing). This project contains all relevant modules for running visual tests with WebdriverIO. Within the `./packages` directory you will find:

- `@wdio/visual-testing`: the WebdriverIO service for integrating visual testing
- `webdriver-image-comparison`: An image compare module that can be used for different NodeJS Test automation frameworks that support the WebDriver protocol

## Storybook Runner (BETA)

<details>
  <summary>Click to find out more documentation about the Storybook Runner BETA</summary>

> Storybook Runner is still in BETA, the docs will later move to the [WebdriverIO](https://webdriver.io/docs/visual-testing) documentation pages.

This module now supports Storybook with a new Visual Runner. This runner automatically scans for a local/remote storybook instance and will create element screenshots of each component. This can be done by adding

```ts
export const config: Options.Testrunner = {
    // ...
    services: ['visual'],
    // ....
}
```

to your `services` and running `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook` through the command line.
It will use Chrome in headless mode as the default browser.

> [!NOTE]
> - Most of the Visual Testing options will also work for the Storybook Runner, see the [WebdriverIO](https://webdriver.io/docs/visual-testing) documentation.
> - The Storybook Runner will overwrite all your capabilities and can only run on the browsers that it supports, see [`--browsers`](#browsers).
> - The Storybook Runner only supports Desktop Web, not Mobile Web.
> - Desktop Mobile Emulation will be released later this year

### Storybook Runner Service Options
Service options can be provided like this

```ts
export const config: Options.Testrunner = {
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

#### `--browsers`

- **Type:** `string`
- **Mandatory:** No
- **Default:** `chrome`, you can select from `chrome|firefox|edge|safari`
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --browsers=chrome,firefox,edge,safari`
- **NOTE:** Only available through the CLI

It will use the provided browsers to take component screenshots

> [!NOTE]
> Make sure you have the browsers you want to run on installed on your local machine

#### `--clip`

- **Type:** `boolean`
- **Mandatory:** No
- **Default:** `true`
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --clip=false`

When disabled it will create a viewport screenshot. When enabled it will create element screenshots based on the [`--clipSelector`](#clipselector) which will reduce the amount of whitespace around the component screenshot and reduce the screenshot size.

#### `--clipSelector`

- **Type:** `string`
- **Mandatory:** No
- **Default:** `#storybook-root > :first-child` for Storybook V7 and `#root > :first-child:not(script):not(style)` for Storybook V6, see also [`--version`](#version)
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --clipSelector="#some-id"`

This is the selector that will be used:
  - to select the element to take the screenshot of
  - for the element to wait to be visible before a screenshot is taken

#### `--headless`

- **Type:** `boolean`
- **Mandatory:** No
- **Default:** `true`
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --headless=false`
- **NOTE:** Only available through the CLI

This will run the tests by default in headless mode (when the browser supports it) or can be disabled

#### `--numShards`

- **Type:** `number`
- **Mandatory:** No
- **Default:** `true`
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --numShards=10`

This will be the number of parallel instances that will be used to run the stories. This will be limited by the `maxInstances` in your `wdio.conf`-file.

> [!IMPORTANT]
> When running in `headless`-mode then do not increase the number to more than 20 to prevent flakiness due to resource restrictions

#### `--skipStories`

- **Type:** `string|regex`
- **Mandatory:** No
- **Default:** null
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --skipStories="/.*button.*/gm"`

 This can be:
  -  a string (`example-button--secondary,example-button--small`)
  - or a regex (`"/.*button.*/gm"`)

to skip certain stories. Use the `id` of the story that can be found in the URL of the story. For example, the `id` in this URL `http://localhost:6006/?path=/story/example-page--logged-out` is `example-page--logged-out`

#### `--url`

- **Type:** `string`
- **Mandatory:** No
- **Default:** `http://127.0.0.1:6006`
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --url="https://example.com"`

The URL where your Storybook instance is hosted.

#### `--version`

- **Type:** `number`
- **Mandatory:** No
- **Default:** 7
- **Example:** `npx wdio tests/configs/wdio.local.desktop.storybook.conf.ts --storybook --version=6`

 This is the version of Storybook, it defaults to `7`. This is needed to know if the V6 [`clipSelector`](#clipselector) needs to be used.

</details>

## Contributing

This package depends on `node-canvas`, make sure you have all [required dependencies](https://github.com/Automattic/node-canvas?tab=readme-ov-file#compiling) installed before starting development.

### Questions

Please join our [Discord](https://discord.webdriver.io) Server if you have any questions or issues contributing to this project. Catch us contributors in the `🙏-contributing` channel.

### Issues

If you have questions, bugs or feature requests, please file an issue. Before submitting an issue, please search the issue archive to help reduce duplicates, and read the [FAQ](../README.md#faq).

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
    $ pnpm install
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
```

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

It will test against a lot of configurations that can be found [here](./tests/configs/wdio.saucelabs.conf.js).
All PRs are automatically checked against Sauce Labs.

## Releasing

To release a version of any of the packages listed above, do the following:

- trigger the [release pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/release.yml)
- a release PR is generated, have this be reviewed and approved by another WebdriverIO member
- merge the PR
- trigger the [release pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/release.yml) again
- a new version should be released 🎉

## Credits

`@wdio/visual-testing` uses an open-source license from Sauce Labs.
