import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import saveTabbablePage from './saveTabbablePage.js'
import type { InternalSaveTabbablePageMethodOptions } from './save.interfaces.js'
import {
    BASE_CHECK_OPTIONS,
    createMethodOptions
} from '../mocks/mocks.js'
import { readScrollPosition, restoreScrollPosition } from '../helpers/scrollPosition.js'
import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'

vi.mock('./saveFullPageScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        devicePixelRatio: 2,
        fileName: 'test-tabbable-page.png'
    })
}))
vi.mock('../clientSideScripts/drawTabbableOnCanvas.js', () => ({
    default: vi.fn()
}))
vi.mock('../clientSideScripts/removeElementFromDom.js', () => ({
    default: vi.fn()
}))
vi.mock('../helpers/scrollPosition.js', () => ({
    readScrollPosition: vi.fn().mockResolvedValue(420),
    restoreScrollPosition: vi.fn(),
}))

describe('saveTabbablePage', () => {
    let saveFullPageScreen: any
    const executeMock = vi.fn().mockResolvedValue(undefined)

    const baseOptions: InternalSaveTabbablePageMethodOptions = {
        browserInstance: {
            execute: executeMock,
            isAndroid: false,
            isMobile: false
        } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: false,
        saveTabbableOptions: {
            wic: {
                ...BASE_CHECK_OPTIONS.wic,
                tabbableOptions: {
                    circle: {
                        backgroundColor: 'red',
                        borderColor: 'blue',
                        borderWidth: 2,
                        fontColor: 'white',
                        fontFamily: 'Arial',
                        fontSize: 10,
                        size: 10,
                        showNumber: true
                    },
                    line: {
                        color: 'blue',
                        width: 1
                    }
                }
            },
            method: createMethodOptions()
        },
        tag: 'test-tabbable-page'
    }

    beforeEach(async () => {
        saveFullPageScreen = (await vi.importMock('./saveFullPageScreen.js')).default
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should throw an error when in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: true
        }

        await expect(saveTabbablePage(options)).rejects.toThrow('The method saveTabbablePage is not supported in native context for native mobile apps!')
        expect(executeMock).not.toHaveBeenCalled()
        expect(saveFullPageScreen).not.toHaveBeenCalled()
    })

    it('should save a tabbable page screenshot', async () => {
        const result = await saveTabbablePage(baseOptions)

        expect(result).toMatchSnapshot()
        expect(executeMock).toHaveBeenCalledTimes(2)
        expect(executeMock.mock.calls).toMatchSnapshot()
        expect(saveFullPageScreen.mock.calls).toMatchSnapshot()
    })

    describe('scroll back (#1231)', () => {
        it('should read the scroll position before the tabbables are drawn and scroll back after the canvas is removed', async () => {
            await saveTabbablePage(baseOptions)

            // Drawing the tabbables scrolls to the top, so the position must be read before it
            expect(vi.mocked(readScrollPosition).mock.invocationCallOrder[0]).toBeLessThan(executeMock.mock.invocationCallOrder[0])
            expect(executeMock.mock.calls[0][0]).toBe(drawTabbableOnCanvas)
            expect(executeMock.mock.calls[1][0]).toBe(removeElementFromDom)
            expect(restoreScrollPosition).toHaveBeenCalledWith(baseOptions.browserInstance, 420, baseOptions.instanceData.isIOS)
            expect(vi.mocked(restoreScrollPosition).mock.invocationCallOrder[0]).toBeGreaterThan(executeMock.mock.invocationCallOrder[1])
        })

        it('should scroll back and keep the original error when the screenshot fails', async () => {
            const screenshotError = new Error('screenshot failed')
            saveFullPageScreen.mockRejectedValueOnce(screenshotError)

            await expect(saveTabbablePage(baseOptions)).rejects.toThrow(screenshotError)

            expect(restoreScrollPosition).toHaveBeenCalledWith(baseOptions.browserInstance, 420, baseOptions.instanceData.isIOS)
        })

        it('should not touch the scroll position in a native context', async () => {
            await expect(saveTabbablePage({ ...baseOptions, isNativeContext: true })).rejects.toThrow()

            expect(readScrollPosition).not.toHaveBeenCalled()
            expect(restoreScrollPosition).not.toHaveBeenCalled()
        })
    })
})
