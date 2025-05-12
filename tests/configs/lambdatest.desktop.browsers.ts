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
    const bidiEmulatedDesktopSpecs = join(process.cwd(), './tests/specs/desktop.bidi.emulated.spec.ts')
    const defaultBrowserLambdaTestOptions = {
        'LT:Options': {
            platformName: 'Windows 10',
            build: buildName,
            project: '@wdio/visual-testing',
            w3c: true,
            resolution: '1600x1200',
            queueTimeout: 900,
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

        /**
         * Windows
         */
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserLambdaTestOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [bidiEmulatedDesktopSpecs],
            ...defaultBrowserLambdaTestOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },
        {
            browserName: 'firefox',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserLambdaTestOptions,
            'wdio-ics:options': {
                logName: 'Firefox latest',
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserLambdaTestOptions,
            'wdio-ics:options': {
                logName: 'Microsoft Edge latest',
            },
            'ms:edgeOptions':{
                args: ['--guest']
            },
            // Adding this because there is an error
            // Failed to open new tab - no browser is open
            'wdio:enforceWebDriverClassic': true
        },

        // /**
        //  * Mac
        //  */
        {
            browserName: 'Safari',
            browserVersion: 'latest',
            specs: [deskSpecs],
            'LT:Options': {
                ...defaultBrowserLambdaTestOptions['LT:Options'],
                platformName: 'MacOS Sequoia',
            },
            'wdio-ics:options': {
                logName: 'SafariLatest',
            },
        },
    ]
}
