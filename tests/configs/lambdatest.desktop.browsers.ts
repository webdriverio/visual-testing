import { join } from 'node:path'

export function lambdaDesktopBrowsers({
    buildName,
}: {
    buildName: string;
}): WebdriverIO.Capabilities[] {
    const basicSpecs = join(process.cwd(), './tests/specs/basics.spec.ts')
    const saveMethodFolderSpecs = join(
        process.cwd(),
        './tests/specs/saveMethodsFolders.spec.ts'
    )
    const checkMethodFolderSpecs = join(
        process.cwd(),
        './tests/specs/checkMethodsFolders.spec.ts'
    )
    const deskSpecs = join(process.cwd(), './tests/specs/desktop.spec.ts')
    const defaultBrowserLambdaTestOptions = {
        'LT:Options': {
            platformName: 'Windows 10',
            build: buildName,
            project: '@wdio/visual-testing',
            w3c: true,
            resolution: '1600x1200',
        }
    }

    return [
        /**
         * Windows basic checks
         */
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [basicSpecs],
            ...defaultBrowserLambdaTestOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [checkMethodFolderSpecs],
            ...defaultBrowserLambdaTestOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [saveMethodFolderSpecs],
            ...defaultBrowserLambdaTestOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },

        // /**
        //  * Windows
        //  */
        // {
        //     browserName: 'chrome',
        //     browserVersion: 'latest',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'chrome-latest',
        //     },
        // },
        // {
        //     browserName: 'chrome',
        //     browserVersion: 'latest-1',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'chrome-latest-1',
        //     },
        // },
        // {
        //     browserName: 'chrome',
        //     browserVersion: 'latest-2',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'chrome-latest-2',
        //     },
        // },
        // {
        //     browserName: 'firefox',
        //     browserVersion: 'latest',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'Firefox latest',
        //     },
        //     // Adding this because there is an error
        //     // Command browsingContext.navigate with id 9 (with the following parameter: {"context":"c3908ff5-45d5-4943-bd82-8d19a968dab6","url":"http://guinea-pig.webdriver.io/image-compare.html","wait":"complete"}) timed out
        //     'wdio:enforceWebDriverClassic': true
        // },
        // {
        //     browserName: 'firefox',
        //     browserVersion: 'latest-1',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'Firefox latest-1',
        //     },
        //     // Adding this because there is an error
        //     // Command browsingContext.navigate with id 9 (with the following parameter: {"context":"c3908ff5-45d5-4943-bd82-8d19a968dab6","url":"http://guinea-pig.webdriver.io/image-compare.html","wait":"complete"}) timed out
        //     'wdio:enforceWebDriverClassic': true
        // },
        // {
        //     browserName: 'firefox',
        //     browserVersion: 'latest-2',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'Firefox latest-2',
        //     },
        //     // Adding this because there is an error
        //     // Command browsingContext.navigate with id 9 (with the following parameter: {"context":"c3908ff5-45d5-4943-bd82-8d19a968dab6","url":"http://guinea-pig.webdriver.io/image-compare.html","wait":"complete"}) timed out
        //     'wdio:enforceWebDriverClassic': true
        // },
        // {
        //     browserName: 'MicrosoftEdge',
        //     browserVersion: 'latest',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'Microsoft Edge latest',
        //     },
        //     'ms:edgeOptions':{
        //         args: ['--guest']
        //     },
        //     // Adding this because there is an error
        //     // Failed to open new tab - no browser is open
        //     'wdio:enforceWebDriverClassic': true
        // },
        // {
        //     browserName: 'MicrosoftEdge',
        //     browserVersion: 'latest-1',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'Microsoft Edge latest-1',
        //     },
        //     'ms:edgeOptions':{
        //         args: ['--guest']
        //     },
        //     // Adding this because there is an error
        //     // Failed to open new tab - no browser is open
        //     'wdio:enforceWebDriverClassic': true
        // },
        // {
        //     browserName: 'MicrosoftEdge',
        //     browserVersion: 'latest-2',
        //     platformName: 'Windows 10',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'Microsoft Edge latest-2',
        //     },
        //     'ms:edgeOptions':{
        //         args: ['--guest']
        //     },
        //     // Adding this because there is an error
        //     // Failed to open new tab - no browser is open
        //     'wdio:enforceWebDriverClassic': true
        // },

        // /**
        //  * Mac
        //  */
        // {
        //     browserName: 'safari',
        //     browserVersion: '14',
        //     platformName: 'macOS 11.00',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'BigSurSafari14',
        //     },
        // },
        // {
        //     browserName: 'safari',
        //     browserVersion: '15',
        //     platformName: 'macOS 12',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'macOS12-15',
        //     },
        // },
        // {
        //     browserName: 'safari',
        //     browserVersion: '16',
        //     platformName: 'macOS 12',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'macOS12-16',
        //     },
        // },
        // {
        //     browserName: 'safari',
        //     browserVersion: '17',
        //     platformName: 'macOS 13',
        //     specs: [deskSpecs],
        //     ...defaultBrowserLambdaTestOptions,
        //     'wdio-ics:options': {
        //         logName: 'macOS13-17',
        //     },
        // },
    ]
}
