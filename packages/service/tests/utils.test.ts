import { describe, it, expect } from 'vitest'
import { getFolders, getInstanceData } from '../src/utils.js'

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
        const capabilities = {
            browserName: 'chrome',
            version: '75.123',
            platformName: 'osx',
            platformVersion: '12',
        } as WebdriverIO.Capabilities
        const browser = {
            capabilities,
            requestedCapabilities: capabilities,
        } as any as WebdriverIO.Browser

        it('should return instance data when the minimum of capabilities is provided', async() => {
            const capabilities = {} as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when wdio-ics option log name is provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                'wdio-ics:options': {
                    logName: 'wdio-ics-logName',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when log name is provided', async () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                'wdio-ics:options': {
                    foo: 'bar',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when the sauce log name is provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                'sauce:options': {
                    logName: 'sauceLogName',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when the appium log name is provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                'appium:options': {
                    logName: 'appiumLogName',
                },
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return instance data when all capabilities are provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                deviceName: 'deviceName',
                platformName: 'platformName',
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return platformName based on the currentCapabilities.platform', async() => {
            const capabilities = {}
            expect(await getInstanceData(capabilities, {
                ...browser,
                platform: 'browser.platform'
            } as any)).toMatchSnapshot()
        })

        it('should return correct instance data when JSONWP Mobile capabilities are provided', async() => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                deviceName: 'deviceName',
                platformName: 'platformName',
                nativeWebScreenshot: true,
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })

        it('should return correct instance data when W3C Mobile capabilities are provided', async () => {
            const capabilities = {
                browserName: 'chrome',
                logName: 'logName',
                'appium:deviceName': 'appium:deviceName',
                platformName: 'platformName',
                'appium:nativeWebScreenshot': true,
            } as WebdriverIO.Capabilities
            expect(await getInstanceData(capabilities, browser)).toMatchSnapshot()
        })
    })
})
