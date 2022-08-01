const { join } = require('path')

module.exports = function sauceDesktopBrowsers({ buildName }) {
    const basicSpecs = join(process.cwd(), './tests/specs/basics.spec.js')
    const saveMethodFolderSpecs = join(
        process.cwd(),
        './tests/specs/saveMethodsFolders.spec.js'
    )
    const checkMethodFolderSpecs = join(
        process.cwd(),
        './tests/specs/checkMethodsFolders.spec.js'
    )
    const deskSpecs = join(process.cwd(), './tests/specs/desktop.spec.js')
    const defaultBrowserSauceOptions = {
        build: buildName,
        screenResolution: '1600x1200',
        seleniumVersion: '3.141.59',
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
            'sauce:options': {
                logName: 'chrome-latest',
                ...defaultBrowserSauceOptions,
            },
            ...chromeOptions,
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [checkMethodFolderSpecs],
            'sauce:options': {
                logName: 'chrome-latest',
                ...defaultBrowserSauceOptions,
            },
            ...chromeOptions,
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [saveMethodFolderSpecs],
            'sauce:options': {
                logName: 'chrome-latest',
                ...defaultBrowserSauceOptions,
            },
            ...chromeOptions,
        },

        /**
         * Windows
         */
        {
            browserName: 'chrome',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'chrome-latest',
                ...defaultBrowserSauceOptions,
            },
            ...chromeOptions,
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest-1',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'chrome-latest-1',
                ...defaultBrowserSauceOptions,
            },
            ...chromeOptions,
        },
        {
            browserName: 'chrome',
            browserVersion: 'latest-2',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'chrome-latest-2',
                ...defaultBrowserSauceOptions,
            },
            ...chromeOptions,
        },
        {
            browserName: 'firefox',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'Firefox latest',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'firefox',
            browserVersion: 'latest-1',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'Firefox latest-1',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'firefox',
            browserVersion: 'latest-2',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'Firefox latest-2',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: '18.17763',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'Microsoft Edge 18',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: 'latest',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'Microsoft Edge latest',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: 'latest-1',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'Microsoft Edge latest-1',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'MicrosoftEdge',
            browserVersion: 'latest-2',
            platformName: 'Windows 10',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'Microsoft Edge latest-2',
                ...defaultBrowserSauceOptions,
            },
        },

        /**
         * Mac
         */
        {
            browserName: 'safari',
            browserVersion: '12',
            platformName: 'macOS 10.14',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'MojaveSafari12',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'safari',
            browserVersion: '13',
            platformName: 'macOS 10.15',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'CatalinaSafari13',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'safari',
            browserVersion: '14',
            platformName: 'macOS 11.00',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'BigSurSafari14',
                ...defaultBrowserSauceOptions,
            },
        },
        {
            browserName: 'safari',
            browserVersion: '15',
            platformName: 'macOS 12',
            specs: [deskSpecs],
            'sauce:options': {
                logName: 'macOS12-15',
                ...defaultBrowserSauceOptions,
            },
        },
    ]
}
