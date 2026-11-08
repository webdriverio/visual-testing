import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mock } from 'vitest-mock-extended'
import checkTabbablePage from './checkTabbablePage.js'
import type { InternalCheckTabbablePageMethodOptions } from './check.interfaces.js'
import { BASE_CHECK_OPTIONS } from '../mocks/mocks.js'
import { readScrollPosition, restoreScrollPosition } from '../helpers/scrollPosition.js'
import drawTabbableOnCanvas from '../clientSideScripts/drawTabbableOnCanvas.js'
import removeElementFromDom from '../clientSideScripts/removeElementFromDom.js'

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
vi.mock('./checkFullPageScreen.js', () => ({
    default: vi.fn().mockResolvedValue({
        fileName: 'test-tabbable.png',
        misMatchPercentage: 0,
        isExactSameImage: true,
        isNewBaseline: false,
        isAboveTolerance: false,
    })
}))

describe('checkTabbablePage', () => {
    let checkFullPageScreenSpy: ReturnType<typeof vi.fn>

    const baseOptions: InternalCheckTabbablePageMethodOptions = {
        checkTabbableOptions: {
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
                        showNumber: true,
                    },
                    line: {
                        color: 'green',
                        width: 2,
                    },
                }
            },
            method: {
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                enableLegacyScreenshotMethod: false,
                fullPageScrollTimeout: 1500,
                hideAfterFirstScroll: [],
                hideScrollBars: true,
                hideElements: [],
                removeElements: [],
                waitForFontsLoaded: true,
            }
        },
        browserInstance: {
            isAndroid: false,
            execute: vi.fn().mockResolvedValue(undefined)
        } as any,
        folders: BASE_CHECK_OPTIONS.folders,
        instanceData: BASE_CHECK_OPTIONS.instanceData,
        isNativeContext: false,
        tag: 'test-tabbable',
        testContext: BASE_CHECK_OPTIONS.testContext
    }

    beforeEach(async () => {
        const checkFullPageScreen = (await import('./checkFullPageScreen.js')).default
        checkFullPageScreenSpy = vi.mocked(checkFullPageScreen)
    })

    afterEach(() => {
        vi.clearAllMocks()
    })

    it('should throw error when used in native context', async () => {
        const options = {
            ...baseOptions,
            isNativeContext: true
        }

        await expect(checkTabbablePage(options)).rejects.toThrow(
            'The method checkTabbablePage is not supported in native context for native mobile apps!'
        )
    })

    it('should execute checkTabbablePage with basic options', async () => {
        const result = await checkTabbablePage(baseOptions)

        expect(result).toMatchSnapshot()
        expect(baseOptions.browserInstance.execute).toMatchSnapshot()
        expect(checkFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle Android device correctly', async () => {
        const options = {
            ...baseOptions,
            browserInstance: {
                isAndroid: true,
                execute: vi.fn().mockResolvedValue(undefined)
            } as any,
            instanceData: {
                ...baseOptions.instanceData,
                deviceName: 'Pixel 4',
                isAndroid: true,
                isIOS: false,
                platformName: 'Android',
                platformVersion: '11.0'
            },
            testContext: {
                ...baseOptions.testContext,
                instanceData: {
                    ...baseOptions.testContext.instanceData,
                    deviceName: 'Pixel 4',
                    platform: { name: 'Android', version: '11.0' },
                    isAndroid: true,
                    isIOS: false
                }
            }
        }

        await checkTabbablePage(options)

        expect(checkFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle custom tabbable options', async () => {
        const options = {
            ...baseOptions,
            checkTabbableOptions: {
                ...baseOptions.checkTabbableOptions,
                wic: {
                    ...baseOptions.checkTabbableOptions.wic,
                    tabbableOptions: {
                        circle: {
                            backgroundColor: 'yellow',
                            borderColor: 'black',
                            borderWidth: 3,
                            fontColor: 'black',
                            fontFamily: 'Helvetica',
                            fontSize: 12,
                            size: 15,
                            showNumber: false,
                        },
                        line: {
                            color: 'red',
                            width: 3,
                        },
                    }
                }
            }
        }

        await checkTabbablePage(options)

        expect(baseOptions.browserInstance.execute).toMatchSnapshot()
    })

    it('should handle errors during execution', async () => {
        const options = {
            ...baseOptions,
            browserInstance: {
                ...baseOptions.browserInstance,
                execute: vi.fn().mockRejectedValue(new Error('Execution failed')),
                sessionStatus: vi.fn(),
                sessionNew: vi.fn(),
                sessionEnd: vi.fn(),
                sessionSubscribe: vi.fn(),
            } as any
        }

        await expect(checkTabbablePage(options)).rejects.toThrow('Execution failed')
    })

    it('should handle hybrid app options correctly', async () => {
        const options = {
            ...baseOptions,
            checkTabbableOptions: {
                ...baseOptions.checkTabbableOptions,
                wic: {
                    ...baseOptions.checkTabbableOptions.wic,
                    isHybridApp: true
                }
            }
        }

        await checkTabbablePage(options)

        expect(checkFullPageScreenSpy.mock.calls[0]).toMatchSnapshot()
    })

    it('should handle default tabbable options', async () => {
        const options = {
            ...baseOptions,
            checkTabbableOptions: {
                ...baseOptions.checkTabbableOptions,
                wic: {
                    ...baseOptions.checkTabbableOptions.wic,
                    tabbableOptions: {
                        circle: {
                            backgroundColor: 'red',
                            borderColor: 'blue',
                            borderWidth: 2,
                            fontColor: 'white',
                            fontFamily: 'Arial',
                            fontSize: 10,
                            size: 10,
                            showNumber: true,
                        },
                        line: {
                            color: 'green',
                            width: 2,
                        },
                    }
                }
            }
        }

        await checkTabbablePage(options)

        expect(baseOptions.browserInstance.execute).toMatchSnapshot()
    })

    it('should not use the scroll container option of the full page commands (#125)', async () => {
        await checkTabbablePage({
            ...baseOptions,
            checkTabbableOptions: { ...baseOptions.checkTabbableOptions, method: { ...baseOptions.checkTabbableOptions.method, scrollContainer: mock<WebdriverIO.Element>() } },
        })

        expect(checkFullPageScreenSpy.mock.calls[0][0].checkFullPageOptions.method.scrollContainer).toBeUndefined()
    })

    describe('scroll back (#1231)', () => {
        it('should read the scroll position before the tabbables are drawn and scroll back after the canvas is removed', async () => {
            await checkTabbablePage(baseOptions)

            const execute = vi.mocked(baseOptions.browserInstance.execute).mock
            // Drawing the tabbables scrolls to the top, so the position must be read before it
            expect(vi.mocked(readScrollPosition).mock.invocationCallOrder[0]).toBeLessThan(execute.invocationCallOrder[0])
            expect(execute.calls[0][0]).toBe(drawTabbableOnCanvas)
            expect(execute.calls[1][0]).toBe(removeElementFromDom)
            expect(restoreScrollPosition).toHaveBeenCalledWith(baseOptions.browserInstance, 420, baseOptions.instanceData.isIOS)
            expect(vi.mocked(restoreScrollPosition).mock.invocationCallOrder[0]).toBeGreaterThan(execute.invocationCallOrder[1])
        })

        it('should scroll back and keep the original error when the check fails', async () => {
            const checkError = new Error('check failed')
            checkFullPageScreenSpy.mockRejectedValueOnce(checkError)

            await expect(checkTabbablePage(baseOptions)).rejects.toThrow(checkError)

            expect(restoreScrollPosition).toHaveBeenCalledWith(baseOptions.browserInstance, 420, baseOptions.instanceData.isIOS)
        })

        it('should not touch the scroll position in a native context', async () => {
            await expect(checkTabbablePage({ ...baseOptions, isNativeContext: true })).rejects.toThrow()

            expect(readScrollPosition).not.toHaveBeenCalled()
            expect(restoreScrollPosition).not.toHaveBeenCalled()
        })
    })
})
