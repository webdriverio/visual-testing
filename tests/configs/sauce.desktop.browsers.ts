import { join } from 'node:path'

export function sauceDesktopBrowsers({
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
    const defaultBrowserSauceOptions = {
        'sauce:options': {
            build: buildName,
            screenResolution: '1600x1200',
        },
    }
    const chromeOptions = {
        'goog:chromeOptions': {},
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
            ...defaultBrowserSauceOptions,
            ...chromeOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [checkMethodFolderSpecs],
            ...defaultBrowserSauceOptions,
            ...chromeOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [saveMethodFolderSpecs],
            ...defaultBrowserSauceOptions,
            ...chromeOptions,
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
            ...defaultBrowserSauceOptions,
            ...chromeOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest',
            },
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest-1',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            ...chromeOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest-1',
            },
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest-2',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            ...chromeOptions,
            'wdio-ics:options': {
                logName: 'chrome-latest-2',
            },
        },
        {
            browserName: 'firefox',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'Firefox latest',
            },
        },
        {
            browserName: 'firefox',
            browserVersion: 'latest-1',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'Firefox latest-1',
            },
        },
        {
            browserName: 'firefox',
            browserVersion: 'latest-2',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'Firefox latest-2',
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'Microsoft Edge latest',
            },
            'ms:edgeOptions':{
                args: ['--guest']
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: 'latest-1',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'Microsoft Edge latest-1',
            },
            'ms:edgeOptions':{
                args: ['--guest']
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: 'latest-2',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'Microsoft Edge latest-2',
            },
            'ms:edgeOptions':{
                args: ['--guest']
            },
        },

        /**
         * Mac
         */
        {
            browserName: 'safari',
            browserVersion: '14',
            platformName: 'macOS 11.00',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'BigSurSafari14',
            },
        },
        {
            browserName: 'safari',
            browserVersion: '15',
            platformName: 'macOS 12',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'macOS12-15',
            },
        },
        {
            browserName: 'safari',
            browserVersion: '16',
            platformName: 'macOS 12',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'macOS12-16',
            },
        },
        {
            browserName: 'safari',
            browserVersion: '17',
            platformName: 'macOS 13',
            specs: [deskSpecs],
            ...defaultBrowserSauceOptions,
            'wdio-ics:options': {
                logName: 'macOS13-17',
            },
        },
    ]
}
