import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import saveElement from './saveElement.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import {
    BASE_CHECK_OPTIONS,
    createMethodOptions
} from '../mocks/mocks.js'

vi.mock('./saveAppElement.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-app-element.png'
    })
}))
vi.mock('./saveWebElement.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-web-element.png'
    })
}))

describe('saveElement', () => {
    let saveAppElementSpy: ReturnType<typeof vi.fn>
    let saveWebElementSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalSaveElementMethodOptions = {
        browserInstance: { isAndroid: false, isMobile: false } as any,
        element: {
            elementId: 'test-element',
            selector: '#test-element',
            isDisplayed: vi.fn().mockResolvedValue(true),
            getSize: vi.fn().mockResolvedValue({ width: 100, height: 100 }),
            getLocation: vi.fn().mockResolvedValue({ x: 0, y: 0 })
        } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: true,
        saveElementOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: createMethodOptions()
        },
        tag: 'test-element'
    }

    beforeEach(async () => {
        const saveAppElement = (await import('./saveAppElement.js')).default
        const saveWebElement = (await import('./saveWebElement.js')).default

        saveAppElementSpy = vi.mocked(saveAppElement)
        saveWebElementSpy = vi.mocked(saveWebElement)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should execute saveAppElement when isNativeContext is true', async () => {
        const result = await saveElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(saveAppElementSpy.mock.calls[0]).toMatchSnapshot()
        expect(saveWebElementSpy).not.toHaveBeenCalled()
    })

    it('should execute saveWebElement when isNativeContext is false', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: false
        }

        const result = await saveElement(options)

        expect(result).toMatchSnapshot()
        expect(saveWebElementSpy.mock.calls[0]).toMatchSnapshot()
        expect(saveAppElementSpy).not.toHaveBeenCalled()
    })
})
