import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import checkElement from './checkElement.js'
import type { InternalCheckElementMethodOptions } from './check.interfaces.js'
import type { WicElement } from './element.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'

// Mock the dependencies
vi.mock('./checkAppElement.js', () => ({
    default: vi.fn().mockResolvedValue({
        fileName: 'test-app-element.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))

vi.mock('./checkWebElement.js', () => ({
    default: vi.fn().mockResolvedValue({
        fileName: 'test-web-element.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))

describe('checkElement', () => {
    let checkAppElementSpy: ReturnType<typeof vi.fn>
    let checkWebElementSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalCheckElementMethodOptions = {
        checkElementOptions: {
            wic: BASE_CHECK_OPTIONS.wic,
            method: {}
        },
        browserInstance: { isAndroid: false } as any,
        element: { selector: '#test-element' } as WicElement,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: true,
        tag: 'test-element',
        testContext: {
            ...BASE_CHECK_OPTIONS.testContext,
            commandName: 'checkElement'
        }
    }

    beforeEach(async () => {
        const checkAppElement = (await import('./checkAppElement.js')).default
        const checkWebElement = (await import('./checkWebElement.js')).default

        checkAppElementSpy = vi.mocked(checkAppElement)
        checkWebElementSpy = vi.mocked(checkWebElement)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should call checkAppElement when isNativeContext is true', async () => {
        const result = await checkElement(baseOptions)

        expect(result).toMatchSnapshot()
        expect(checkAppElementSpy.mock.calls[0]).toMatchSnapshot()
        expect(checkWebElementSpy).not.toHaveBeenCalled()
    })

    it('should call checkWebElement', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: false
        }

        const result = await checkElement(options)

        expect(result).toMatchSnapshot()
        expect(checkWebElementSpy.mock.calls[0]).toMatchSnapshot()
        expect(checkAppElementSpy).not.toHaveBeenCalled()
    })
})
