# Contributing

## Questions

Please first read through the [FAQ](../README.md#faq). If that doesn't answer your question you can file an issue, see [issues](./CONTRIBUTING.md#issues).

## Issues

If you have a questions, bug or feature request, please file an issue. Before submitting an issue, please search the issue archive to help reduce duplicates, and read the [FAQ](../README.md#faq).
If you can't find it there you can submit an issue where you can submit:

-   🐛**Bug report**: Create a report to help us improve
-   📖**Documentation**: Suggest improvements or report missing/unclear documentation.
-   💡**Feature request**: Suggest an idea for this module.
-   💬**Question**: Ask questions.

# Contributing to Source Code (Pull Requests)

In order to create a PR for this project and start contributing follow this step by step guide:

-   Fork the project.
-   Clone the project somewhere on your computer

    ```
    $ git clone https://github.com/wswebcreation/wdio-image-comparison-service.git
    ```

-   Go to the directory and setup the project

    ```
    $ cd wdio-image-comparison-service
    $ npm install
    ```

-   Run the watch mode that will automatically transpile the code

    ```
    $ npm run watch
    ```

-   And create the new feature / fix a bug

## Tests

There are several test that need to be executed to be able to test the module. When adding a PR all tests must at least pass the local tests.
Each PR is automatically tested against Sauce Labs, see [Travis-ci with Sauce Labs](./CONTRIBUTING.md#travis-ci-with-sauce-labs-not-needed-for-a-pr).
Before approving a PR the core contributors will test the PR against emulators / simulators / real devices.

### Local

First a local baseline needs to be created. This can be done with

```
// With the webdriver protocol
$ npm run test.local.init

// With the Chrome DevTools protocol
$ npm run test.local.dev.tools.init
```

This command will create a folder called `localBaseline` that will hold all the baseline images.

Then run

```
// With the webdriver protocol
npm run test.local.desktop

// With the Chrome DevTools protocol
$ npm run test.local.dev.tools.desktop
```

This will run all tests on a local machine on Chrome.

## Travis-ci with Sauce Labs (not needed for a PR)

The command below is used to test the build on [Travis-ci](https://travis-ci.org/wswebcreation/protractor-image-comparison/), it can only be used there and not for local development.

```
$ npm run test.saucelabs
```

It will test against a lot of configurations that can be found [here](./tests/configs/wdio.saucelabs.conf.js).

All PR's are automatically checked against Sauce Labs.
