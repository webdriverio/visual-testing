import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import saveScreen from './saveScreen.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

vi.mock('./saveAppScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-app-screen.png'
    })
}))
vi.mock('./saveWebScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-web-screen.png'
    })
}))

describe('saveScreen', () => {
    let saveAppScreen: any
    let saveWebScreen: any

    const baseOptions: InternalSaveScreenMethodOptions = {
        browserInstance: { isAndroid: false, isMobile: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: false,
        saveScreenOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: {
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                enableLegacyScreenshotMethod: false,
                hideScrollBars: true,
                hideElements: [],
                removeElements: [],
                waitForFontsLoaded: true,
            }
        },
        tag: 'test-screen'
    }

    beforeEach(async () => {
        saveAppScreen = (await import('./saveAppScreen.js')).default
        saveWebScreen = (await import('./saveWebScreen.js')).default
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should call saveAppScreen when in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: true
        }
        const result = await saveScreen(options)

        expect(result).toMatchSnapshot()
        expect(saveAppScreen).toHaveBeenCalledWith(options)
        expect(saveWebScreen).not.toHaveBeenCalled()
    })

    it('should call saveWebScreen when not in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: false
        }
        const result = await saveScreen(options)

        expect(result).toMatchSnapshot()
        expect(saveWebScreen).toHaveBeenCalledWith(options)
        expect(saveAppScreen).not.toHaveBeenCalled()
    })
})
