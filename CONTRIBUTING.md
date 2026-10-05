# Contributing

## Updating the packages

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
-   pnpm-run-all2 6.2.3
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

```

</details>

## Questions

Please join our [Discord](https://discord.webdriver.io) Server if you have any questions or issues contributing to this project. Catch us contributors in the `🙏-contributing` channel.

## Issues

If you have questions, bugs or feature requests, please file an issue. Before submitting an issue, please search the issue archive to help reduce duplicates, and read the [FAQ](https://webdriver.io/docs/visual-testing/faq/).

If you can't find it there you can submit an issue where you can submit:

-   🐛**Bug report**: Create a report to help us improve
-   📖**Documentation**: Suggest improvements or report missing/unclear documentation.
-   💡**Feature request**: Suggest an idea for this module.
-   💬**Question**: Ask questions.

## Development Workflow

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

## Testing

Several tests need to be executed to be able to test the module. When adding a PR all tests must at least pass the local tests. GitHub Actions tests each PR automatically:

-   [`checks`](https://github.com/webdriverio/visual-testing/actions/workflows/checks.yml): lint, unit tests and the WebdriverIO v10 tests on local headless Chrome (Mocha and Jasmine). It runs for every PR, also from forks, and for every push to `main`.
-   [`e2e`](https://github.com/webdriverio/visual-testing/actions/workflows/e2e.yml): the tests on LambdaTest and Sauce Labs. These jobs need the cloud credentials, so they do not run for PRs from forks.

Before approving a PR the core contributors will test the PR against emulators/simulators / real devices.

### Local Testing

First, a local baseline needs to be created. This can be done with:

```sh
// With the webdriver protocol
$ pnpm run test.local.init
```

This command will create a folder called `localBaseline` that will hold all the baseline images.

Then run:

```sh
// With the webdriver protocol
pnpm run test.local.desktop
```

This will run all tests on a local machine on Chrome.

#### WebdriverIO v10 tests on local headless Chrome

These are the tests of the `checks` workflow. They create their baselines in the same run, so `test.local.init` is not needed:

```sh
pnpm run test.local.chrome.v10
pnpm run test.local.chrome.v10.jasmine
```

### Local Storybook Runner Testing (Beta)

First, a local baseline needs to be created. This can be done with:

```sh
pnpm run test.local.desktop.storybook
```

This will Storybook tests with Chrome in headless mode against a Demo Storybook repo located at https://govuk-react.github.io/govuk-react/.

To run the tests with more browsers you can run

```sh
pnpm run test.local.desktop.storybook -- --browsers=chrome,firefox,edge,safari
```

> [!NOTE]
> Make sure you have the browsers you want to run on installed on your local machine

### CI testing with LambdaTest and Sauce Labs (not needed for a PR)

The `e2e` workflow uses the commands below. They need the cloud credentials, so they can only be used there and not for local development:

```sh
pnpm run test.lambdatest.desktop
pnpm run test.lambdatest.emu.web
pnpm run test.lambdatest.sims.web
pnpm run test.ocr.lambdatest.desktop
pnpm run test.saucelabs.app
```

The configurations are in [`tests/configs`](./tests/configs), for example [`wdio.lambdatest.web.conf.ts`](./tests/configs/wdio.lambdatest.web.conf.ts) and [`wdio.saucelabs.app.conf.ts`](./tests/configs/wdio.saucelabs.app.conf.ts).

## Releasing

To release a version of any of the packages listed above, do the following:

-   trigger the [release pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/release.yml)
-   a release PR is generated, have this be reviewed and approved by another WebdriverIO member
-   merge the PR
-   trigger the [release pipeline](https://github.com/webdriverio/visual-testing/actions/workflows/release.yml) again
-   a new version should be released 🎉
