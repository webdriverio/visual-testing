# WebdriverIO Visual Testing 🔎 [![tests](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml/badge.svg)](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml) [![Build Status](https://app.eu-central-1.saucelabs.com/buildstatus/wdio-image-comparison-service)](https://app.eu-central-1.saucelabs.com/u/wdio-image-comparison-service)

For documentation on visual testing with WebdriverIO, please refer to the [docs](webdriver.io/docs/visual-testing). This project contains all relevant modules for running visual tests with WebdriverIO. Within the `./packages` directory you will find:

- `wdio-image-comparison-service`: the WebdriverIO service for integrating visual testing
- `webdriver-image-comparison`: An image compare module that can be used for different NodeJS Test automation frameworks that support the WebDriver protocol

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
    $ git clone https://github.com/wswebcreation/wdio-image-comparison-service.git
    ```

-   Go to the directory and setup the project

    ```sh
    $ cd wdio-image-comparison-service
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

-   And create a new feature / fix a bug

### Testing

Several tests need to be executed to be able to test the module. When adding a PR all tests must at least pass the local tests. Each PR is automatically tested against Sauce Labs, see [our GitHub Actions pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/tests.yml). Before approving a PR the core contributors will test the PR against emulators/simulators / real devices.

#### Local Testing

First, a local baseline needs to be created. This can be done with:

```sh
// With the webdriver protocol
$ npm run test.local.init
```

or

```sh
// With the Chrome DevTools protocol
$ npm run test.local.dev.tools.init
```

This command will create a folder called `localBaseline` that will hold all the baseline images.

Then run:

```sh
// With the webdriver protocol
npm run test.local.desktop
```

or

```sh
// With the Chrome DevTools protocol
$ npm run test.local.dev.tools.desktop
```

This will run all tests on a local machine on Chrome.

#### CI testing with Sauce Labs (not needed for a PR)

The command below is used to test the build on GitHub Actions, it can only be used there and not for local development.

```
$ npm run test.saucelabs
```

It will test against a lot of configurations that can be found [here](./tests/configs/wdio.saucelabs.conf.js).
All PRs are automatically checked against Sauce Labs.

## Credits

`wdio-image-comparison-service` uses an open-source license from Sauce Labs.
