import { describe, it, expect, vi } from 'vitest'
import beforeScreenshot from './beforeScreenshot.js'

describe('beforeScreenshot', () => {
    it('should be able to return the enriched instance data with default options', async () => {
        const MOCKED_EXECUTOR = vi.fn().mockReturnValue('')

        const options = {
            instanceData: {
                appName: 'appName',
                browserName: 'browserName',
                browserVersion: 'browserVersion',
                deviceName: 'deviceName',
                devicePixelRatio: 1,
                deviceScreenSize: {
                    height:1,
                    width: 1,
                },
                devicePlatformRect: {
                    statusBar: { x: 0, y:0, width: 0, height: 0 },
                    homeBar: { x: 0, y:0, width: 0, height: 0 },
                },
                isAndroid: false,
                isIOS: false,
                isMobile: false,
                logName: 'logName',
                mobileViewportPosition:{ top: 0, left: 0, width: 0, height: 0 },
                name: 'name',
                nativeWebScreenshot: false,
                platformName: 'platformName',
                platformVersion: 'platformVersion',
            },
            addressBarShadowPadding: 6,
            disableBlinkingCursor: false,
            disableCSSAnimation: false,
            enableLayoutTesting: false,
            noScrollBars: true,
            toolBarShadowPadding: 6,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            removeElements: [<HTMLElement>(<any>'<div></div>')],
            waitForFontsLoaded: true,
        }

        expect(await beforeScreenshot(MOCKED_EXECUTOR, options)).toMatchSnapshot()
    })

    it('should be able to return the enriched instance data with `addShadowPadding: true`', async () => {
        const MOCKED_EXECUTOR = vi.fn().mockReturnValue('')

        const options = {
            instanceData: {
                appName: 'appName',
                browserName: 'browserName',
                browserVersion: 'browserVersion',
                deviceName: 'deviceName',
                devicePixelRatio: 1,
                deviceScreenSize: {
                    height:1,
                    width: 1,
                },
                devicePlatformRect: {
                    statusBar: { x: 0, y:0, width: 0, height: 0 },
                    homeBar: { x: 0, y:0, width: 0, height: 0 },
                },
                logName: 'logName',
                mobileViewportPosition:{ top: 0, left: 0, width: 0, height: 0 },
                isAndroid: false,
                isIOS: false,
                isMobile: false,
                name: 'name',
                nativeWebScreenshot: false,
                platformName: 'platformName',
                platformVersion: 'platformVersion',
            },
            addressBarShadowPadding: 6,
            disableBlinkingCursor: true,
            disableCSSAnimation: true,
            enableLayoutTesting: false,
            noScrollBars: true,
            toolBarShadowPadding: 6,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            removeElements: [<HTMLElement>(<any>'<div></div>')],
            waitForFontsLoaded: true,
        }

        expect(await beforeScreenshot(MOCKED_EXECUTOR, options, true)).toMatchSnapshot()
    })
})
