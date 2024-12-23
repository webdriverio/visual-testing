import { join } from 'node:path'
import { describe, it, expect, afterEach, vi } from 'vitest'
import afterScreenshot from './afterScreenshot.js'
import { rmSync } from 'node:fs'

vi.mock('../methods/images.js', () => ({
    saveBase64Image: vi.fn()
}))

describe('afterScreenshot', () => {
    const folder = join(process.cwd(), '/.tmp/afterScreenshot')

    afterEach(() => rmSync(folder, { recursive: true, force: true }))

    it('should be able to return the ScreenshotOutput with default options', async () => {
        const MOCKED_EXECUTOR = vi.fn().mockReturnValue('')
        const options = {
            actualFolder: folder,
            base64Image: 'string',
            disableBlinkingCursor: false,
            disableCSSAnimation: false,
            filePath: {
                browserName: 'browserName',
                deviceName: 'deviceName',
                isMobile: false,
                savePerInstance: true,
            },
            fileName: {
                browserName: 'browserName',
                browserVersion: 'browserVersion',
                deviceName: 'deviceName',
                devicePixelRatio: 2,
                formatImageName: '{tag}-{browserName}-{width}x{height}-dpr-{dpr}',
                isMobile: false,
                isTestInBrowser: true,
                logName: 'logName',
                name: 'name',
                outerHeight: 850,
                outerWidth: 1400,
                platformName: 'platformName',
                platformVersion: 'platformVersion',
                screenHeight: 900,
                screenWidth: 1440,
                tag: 'tag',
            },
            hideScrollBars: true,
            isLandscape: false,
            isNativeContext: false,
            hideElements: [<HTMLElement>(<any>'<div></div>')],
            platformName: '',
            removeElements: [<HTMLElement>(<any>'<div></div>')],
        }

        expect(await afterScreenshot(MOCKED_EXECUTOR, options)).toEqual({
            devicePixelRatio: 2,
            fileName: 'tag-browserName-1400x850-dpr-2.png',
            isLandscape: false,
            path: `${process.cwd()}/.tmp/afterScreenshot/desktop_browserName`,
        })
    })
})
