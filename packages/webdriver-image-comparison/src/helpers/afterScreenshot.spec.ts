import afterScreenshot from './afterScreenshot'
import { join } from 'node:path'
import { removeSync } from 'fs-extra'
import { LogLevel } from './options.interface'

describe('afterScreenshot', () => {
    const folder = join(process.cwd(), '/.tmp/afterScreenshot')

    afterEach(() => removeSync(folder))

    it('should be able to return the ScreenshotOutput with default options', async () => {
        const MOCKED_EXECUTOR = jest.fn().mockReturnValue('')
        const options = {
            actualFolder: folder,
            base64Image: 'string',
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
            logLevel: LogLevel.debug,
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
