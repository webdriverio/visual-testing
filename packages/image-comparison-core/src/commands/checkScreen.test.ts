import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import checkScreen from './checkScreen.js'
import type { InternalCheckScreenMethodOptions } from './check.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

vi.mock('./checkAppScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        fileName: 'test-app-screen.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))
vi.mock('./checkWebScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        fileName: 'test-web-screen.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))

describe('checkScreen', () => {
    let checkAppScreenSpy: ReturnType<typeof vi.fn>
    let checkWebScreenSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalCheckScreenMethodOptions = {
        checkScreenOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: {}
        },
        browserInstance: { isAndroid: false } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: true,
        tag: 'test-screen',
        testContext: BASE_CHECK_OPTIONS.testContext
    }

    beforeEach(async () => {
        const checkAppScreen = (await import('./checkAppScreen.js')).default
        const checkWebScreen = (await import('./checkWebScreen.js')).default

        checkAppScreenSpy = vi.mocked(checkAppScreen)
        checkWebScreenSpy = vi.mocked(checkWebScreen)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should call checkAppScreen when isNativeContext is true', async () => {
        const result = await checkScreen(baseOptions)

        expect(result).toMatchSnapshot()
        expect(checkAppScreenSpy.mock.calls[0]).toMatchSnapshot()
        expect(checkWebScreenSpy).not.toHaveBeenCalled()
    })

    it('should call checkWebScreen when isNativeContext is false', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: false
        }

        const result = await checkScreen(options)

        expect(result).toMatchSnapshot()
        expect(checkWebScreenSpy.mock.calls[0]).toMatchSnapshot()
        expect(checkAppScreenSpy).not.toHaveBeenCalled()
    })
})
