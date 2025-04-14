import { describe, it, expect, vi } from 'vitest'
import { determineElementRectangles, determineScreenRectangles, determineStatusAddressToolBarRectangles } from './rectangles.js'
import { IMAGE_STRING } from '../mocks/mocks.js'

describe('rectangles', () => {
    describe('determineElementRectangles', () => {
        it('should determine them for iOS', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                deviceRectangles: {
                    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                    homeBar: { y: 0, x: 0, width: 0, height: 0 },
                    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    screenSize: { height: 0, width: 0 },
                    statusBar: { y: 0, x: 0, width: 0, height: 0 },
                    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                    viewport: { y: 20, x: 30, width: 0, height: 0 },
                },
                isAndroidNativeWebScreenshot: false,
                innerHeight: 678,
                isIOS: true,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // getBoundingClientRect
                .mockResolvedValueOnce({
                    height: 120,
                    width: 120,
                    x: 100,
                    y: 10,
                })

            expect(
                await determineElementRectangles({
                    executor: MOCKED_EXECUTOR,
                    base64Image: IMAGE_STRING,
                    options,
                    element: 'element',
                }),
            ).toMatchSnapshot()
        })

        it('should determine them for Android Native webscreenshot', async () => {
            const options = {
                isAndroid: true,
                devicePixelRatio: 3,
                deviceRectangles: {
                    homeBar: { y: 0, x: 0, width: 0, height: 0 },
                    statusBar: { y: 0, x: 0, width: 0, height: 0 },
                    screenSize: { height: 0, width: 0 },
                    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                    viewport: { y: 200, x: 300, width: 0, height: 0 },
                    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                },
                isAndroidNativeWebScreenshot: true,
                innerHeight: 678,
                isIOS: false,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // getBoundingClientRect
                .mockResolvedValueOnce({
                    height: 300,
                    width: 200,
                    x: 100,
                    y: 10,
                })

            expect(
                await determineElementRectangles({
                    executor: MOCKED_EXECUTOR,
                    base64Image: IMAGE_STRING,
                    options,
                    element: 'element',
                }),
            ).toMatchSnapshot()
        })

        it('should determine them for Android ChromeDriver', async () => {
            const options = {
                isAndroid: true,
                devicePixelRatio: 1,
                deviceRectangles: {
                    homeBar: { y: 0, x: 0, width: 0, height: 0 },
                    statusBar: { y: 0, x: 0, width: 0, height: 0 },
                    screenSize: { height: 0, width: 0 },
                    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                    viewport: { y: 200, x: 300, width: 0, height: 0 },
                    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                },
                isAndroidNativeWebScreenshot: false,
                innerHeight: 678,
                isIOS: false,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // getBoundingClientRect
                .mockResolvedValueOnce({
                    height: 20,
                    width: 375,
                    x: 0,
                    y: 0,
                })

            expect(
                await determineElementRectangles({
                    executor: MOCKED_EXECUTOR,
                    base64Image: IMAGE_STRING,
                    options,
                    element: 'element',
                }),
            ).toMatchSnapshot()
        })

        it('should determine them for a desktop browser', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                deviceRectangles: {
                    homeBar: { y: 0, x: 0, width: 0, height: 0 },
                    statusBar: { y: 0, x: 0, width: 0, height: 0 },
                    screenSize: { height: 0, width: 0 },
                    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                    viewport: { y: 0, x: 0, width: 0, height: 0 },
                    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                },
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIOS: false,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // getElementPositionDesktop for: getElementPositionTopWindow
                .mockResolvedValueOnce({
                    height: 20,
                    width: 375,
                    x: 12,
                    y: 34,
                })

            expect(
                await determineElementRectangles({
                    executor: MOCKED_EXECUTOR,
                    base64Image: IMAGE_STRING,
                    options,
                    element: 'element',
                }),
            ).toMatchSnapshot()
        })

        it('should throw an error when the element height is 0', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                deviceRectangles: {
                    homeBar: { y: 0, x: 0, width: 0, height: 0 },
                    statusBar: { y: 0, x: 0, width: 0, height: 0 },
                    screenSize: { height: 0, width: 0 },
                    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                    viewport: { y: 0, x: 0, width: 0, height: 0 },
                    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                },
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIOS: false,
            }
            const MOCKED_EXECUTOR = vi.fn().mockResolvedValueOnce({
                height: 0,
                width: 375,
                x: 12,
                y: 34,
            })

            try {
                await determineElementRectangles({
                    executor: MOCKED_EXECUTOR,
                    base64Image: IMAGE_STRING,
                    options,
                    element: { selector: '#elementID' },
                })
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false)
            } catch (e: unknown) {
                expect((e as Error).message).toBe('The element, with selector "$(#elementID)",is not visible. The dimensions are 375x0')
            }
        })

        it('should throw an error when the element width is 0', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                deviceRectangles: {
                    homeBar: { y: 0, x: 0, width: 0, height: 0 },
                    statusBar: { y: 0, x: 0, width: 0, height: 0 },
                    screenSize: { height: 0, width: 0 },
                    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                    viewport: { y: 0, x: 0, width: 0, height: 0 },
                    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                },
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIOS: false,
            }
            const MOCKED_EXECUTOR = vi.fn().mockResolvedValueOnce({
                height: 375,
                width: 0,
                x: 12,
                y: 34,
            })

            try {
                await determineElementRectangles({
                    executor: MOCKED_EXECUTOR,
                    base64Image: IMAGE_STRING,
                    options,
                    element: { selector: '#elementID' },
                })
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false)
            } catch (e: unknown) {
                expect((e as Error).message).toBe('The element, with selector "$(#elementID)",is not visible. The dimensions are 0x375')
            }
        })

        it('should throw an error when the element width is 0 and no element selector is provided', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                deviceRectangles: {
                    homeBar: { y: 0, x: 0, width: 0, height: 0 },
                    statusBar: { y: 0, x: 0, width: 0, height: 0 },
                    screenSize: { height: 0, width: 0 },
                    statusBarAndAddressBar: { y: 0, x: 0, width: 0, height: 0 },
                    viewport: { y: 0, x: 0, width: 0, height: 0 },
                    bottomBar: { y: 0, x: 0, width: 0, height: 0 },
                    leftSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                    rightSidePadding: { y: 0, x: 0, width: 0, height: 0 },
                },
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIOS: false,
            }
            const MOCKED_EXECUTOR = vi.fn().mockResolvedValueOnce({
                height: 375,
                width: 0,
                x: 12,
                y: 34,
            })

            try {
                await determineElementRectangles({
                    executor: MOCKED_EXECUTOR,
                    base64Image: IMAGE_STRING,
                    options,
                    element: {},
                })
                // Fail test if above expression doesn't throw anything.
                expect(true).toBe(false)
            } catch (e: unknown) {
                expect((e as Error).message).toBe('The element is not visible. The dimensions are 0x375')
            }
        })
    })

    describe('determineScreenRectangles', () => {
        it('should determine them for iOS', async () => {
            const options = {
                innerHeight: 553,
                innerWidth: 375,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: false,
                isIOS: true,
                devicePixelRatio: 2,
                isLandscape: false,
            }

            expect(await determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should determine them for Android ChromeDriver', async () => {
            const options = {
                innerHeight: 553,
                innerWidth: 375,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: true,
                isIOS: false,
                devicePixelRatio: 2,
                isLandscape: false,
            }

            expect(await determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })

        it('should determine them for Android Native webscreenshot', async () => {
            const options = {
                innerHeight: 553,
                innerWidth: 375,
                isAndroidNativeWebScreenshot: true,
                isAndroidChromeDriverScreenshot: false,
                isIOS: false,
                devicePixelRatio: 2,
                isLandscape: false,
            }

            expect(await determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })
    })

    describe('determineStatusAddressToolBarRectangles', () => {
        it('should determine the rectangles with a status and toolbar blockout', async () => {
            const options = {
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroid: true,
                isAndroidNativeWebScreenshot: true,
                isMobile: true,
                isViewPortScreenshot: true,
            }
            const deviceRectangles =  {
                homeBar: { y: 0, x: 0, width: 0, height: 0 },
                statusBar: { y: 0, x: 0, width: 0, height: 0 },
                screenSize: { height: 0, width: 0 },
                statusBarAndAddressBar: { y: 0, x: 0, width: 1344, height: 320 },
                viewport: { y: 320, x: 0, width: 1344, height: 2601 },
                bottomBar: { y: 2921, x: 0, width: 1344, height: 71 },
                leftSidePadding: { y: 320, x: 0, width: 0, height: 2601 },
                rightSidePadding: { y: 320, x: 1344, width: 0, height: 2601 }
            }

            expect(await determineStatusAddressToolBarRectangles( { deviceRectangles, options })).toMatchSnapshot()
        })

        it('should determine the rectangles that there are no rectangles for this device', async () => {
            const options = {
                blockOutSideBar: false,
                blockOutStatusBar: false,
                blockOutToolBar: false,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isMobile: true,
                isViewPortScreenshot: false,
            }
            const deviceRectangles =  {
                homeBar: { y: 0, x: 0, width: 0, height: 0 },
                statusBar: { y: 0, x: 0, width: 0, height: 0 },
                screenSize: { height: 0, width: 0 },
                statusBarAndAddressBar: { y: 0, x: 0, width: 1344, height: 320 },
                viewport: { y: 320, x: 0, width: 1344, height: 2601 },
                bottomBar: { y: 2921, x: 0, width: 1344, height: 71 },
                leftSidePadding: { y: 320, x: 0, width: 0, height: 2601 },
                rightSidePadding: { y: 320, x: 1344, width: 0, height: 2601 }
            }

            expect(await determineStatusAddressToolBarRectangles({ deviceRectangles, options })).toMatchSnapshot()
        })
    })
})
