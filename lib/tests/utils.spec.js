import { getFolders, getInstanceData } from '../utils'

describe('utils', () => {
    describe('getFolders', () => {
        it('should be able to return the correct folders when no method options are provided', () => {
            const methodOptions = {}
            const folders = {
                baselineFolder: 'folderBase',
                diffFolder: 'folderDiff',
                actualFolder: 'folderActual',
            }

            expect(getFolders(methodOptions, folders)).toMatchSnapshot()
        })
        it('should be able to return the correct folders when method options are provided', () => {
            const methodOptions = {
                baselineFolder: 'methodBase',
                diffFolder: 'methodDiff',
                actualFolder: 'methodActual',
            }
            const folders = {
                baselineFolder: 'folderBase',
                diffFolder: 'folderDiff',
                actualFolder: 'folderActual',
            }

            expect(getFolders(methodOptions, folders)).toMatchSnapshot()
        })
    })

    describe('getInstanceData', () => {
        beforeEach(() => {
            global.browser = {
                capabilities: {
                    browserName: 'chrome',
                    version: '75.123',
                    platformName: 'osx',
                    platformVersion: '12',
                }
            }
        })

        it('should return instance data when the minimum of capabilities is provided', () => {
            const capabilities = {}
            global.browser.capabilities = {}

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return instance data when wdio-ics option log name is provided', () => {
            const capabilities = {
                browserName: 'chrome',
                'wdio-ics:options': {
                    logName: 'wdio-ics-logName',
                },
            }

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return instance data when log name is provided', () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                'wdio-ics:options': {
                    foo: 'bar',
                },
            }

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return instance data when the sauce log name is provided', () => {
            const capabilities = {
                browserName: 'chrome',
                'sauce:options': {
                    logName: 'sauceLogName',
                },
            }

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return instance data when the appium log name is provided', () => {
            const capabilities = {
                browserName: 'chrome',
                'appium:options': {
                    logName: 'appiumLogName',
                },
            }

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return instance data when all capabilities are provided', () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                deviceName: 'deviceName',
                platformName: 'platformName'
            }

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return platformName based on the currentCapabilities.platform', () => {
            const capabilities = {}

            delete browser.capabilities.platformName
            browser.capabilities.platform = 'browser.platform'

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return correct instance data when JSONWP Mobile capabilities are provided', () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                deviceName: 'deviceName',
                platformName: 'platformName',
                nativeWebScreenshot: true,
            }

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should return correct instance data when W3C Mobile capabilities are provided', () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                'appium:deviceName': 'appium:deviceName',
                platformName: 'platformName',
                'appium:nativeWebScreenshot': true,
            }

            expect(getInstanceData(capabilities)).toMatchSnapshot()
        })

        it('should use the currentBrowser values when those are passed', () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                deviceName: 'deviceName',
                platformName: 'platformName'
            }
            const currentBrowser = {
                capabilities: {
                    browserName: 'chrome',
                    version: '75.123',
                    platformName: 'osx',
                    platformVersion: '12',
                }
            }

            expect(getInstanceData(capabilities, currentBrowser)).toMatchSnapshot()
        })
    })
})
