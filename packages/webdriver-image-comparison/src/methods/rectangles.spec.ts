import { determineElementRectangles, determineScreenRectangles, determineStatusAddressToolBarRectangles } from './rectangles'
import { IMAGE_STRING } from '../mocks/mocks'

describe('rectangles', () => {
    describe('determineElementRectangles', () => {
        it('should determine them for iOS', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                isAndroidNativeWebScreenshot: false,
                innerHeight: 678,
                isIos: true,
                isLandscape: false,
            }
            const MOCKED_EXECUTOR = jest
                .fn()
            // getElementPositionIos for: getIosStatusAddressToolBarOffsets
                .mockResolvedValueOnce({
                    sideBar: {
                        height: 240,
                        width: 120,
                        x: 0,
                        y: 70,
                    },
                    statusAddressBar: {
                        height: 94,
                        width: 375,
                        x: 0,
                        y: 0,
                    },
                    toolBar: {
                        height: 5,
                        width: 135,
                        x: 120,
                        y: 799,
                    },
                })
            // getElementPositionIos for: getElementPositionTopScreenNativeMobile
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
                isAndroidNativeWebScreenshot: true,
                innerHeight: 678,
                isIos: false,
                isLandscape: false,
            }
            const MOCKED_EXECUTOR = jest
                .fn()
            // getElementPositionAndroid for: getAndroidStatusAddressToolBarOffsets
                .mockResolvedValueOnce({
                    sideBar: {
                        height: 0,
                        width: 0,
                        x: 0,
                        y: 0,
                    },
                    statusAddressBar: {
                        height: 20,
                        width: 375,
                        x: 0,
                        y: 0,
                    },
                    toolBar: {
                        height: 5,
                        width: 135,
                        x: 120,
                        y: 799,
                    },
                })
            // getElementPositionIos for: getElementPositionTopScreenNativeMobile
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

        it('should determine them for Android ChromeDriver', async () => {
            const options = {
                isAndroid: true,
                devicePixelRatio: 1,
                isAndroidNativeWebScreenshot: false,
                innerHeight: 678,
                isIos: false,
                isLandscape: false,
            }
            const MOCKED_EXECUTOR = jest
                .fn()
            // getElementPositionAndroid for: getElementPositionTopWindow
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
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIos: false,
                isLandscape: false,
            }
            const MOCKED_EXECUTOR = jest
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
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIos: false,
                isLandscape: false,
            }
            const MOCKED_EXECUTOR = jest.fn().mockResolvedValueOnce({
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
            } catch (e) {
                expect(e.message).toBe('The element, with selector "$(#elementID)",is not visible. The dimensions are 375x0')
            }
        })

        it('should throw an error when the element width is 0', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIos: false,
                isLandscape: false,
            }
            const MOCKED_EXECUTOR = jest.fn().mockResolvedValueOnce({
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
            } catch (e) {
                expect(e.message).toBe('The element, with selector "$(#elementID)",is not visible. The dimensions are 0x375')
            }
        })

        it('should throw an error when the element width is 0 and no element selector is provided', async () => {
            const options = {
                isAndroid: false,
                devicePixelRatio: 2,
                isAndroidNativeWebScreenshot: false,
                innerHeight: 500,
                isIos: false,
                isLandscape: false,
            }
            const MOCKED_EXECUTOR = jest.fn().mockResolvedValueOnce({
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
            } catch (e) {
                expect(e.message).toBe('The element is not visible. The dimensions are 0x375')
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
                isIos: true,
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
                isIos: false,
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
                isIos: false,
                devicePixelRatio: 2,
                isLandscape: false,
            }

            expect(await determineScreenRectangles(IMAGE_STRING, options)).toMatchSnapshot()
        })
    })

    describe('determineStatusAddressToolBarRectangles', () => {
        it('should determine the rectangles for the iOS with a status and toolbar blockout', async () => {
            const options = {
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroidNativeWebScreenshot: false,
                isHybridApp: false,
                isLandscape: false,
                isMobile: true,
                isViewPortScreenshot: true,
                platformName: 'iOS',
            }
            const MOCKED_EXECUTOR = jest
                .fn()
            // determineStatusAddressToolBarRectangles for: getIosStatusAddressToolBarOffsets
                .mockResolvedValueOnce({
                    sideBar: {
                        height: 240,
                        width: 120,
                        x: 0,
                        y: 70,
                    },
                    statusAddressBar: {
                        height: 94,
                        width: 375,
                        x: 0,
                        y: 0,
                    },
                    toolBar: {
                        height: 5,
                        width: 135,
                        x: 120,
                        y: 799,
                    },
                })

            expect(await determineStatusAddressToolBarRectangles(MOCKED_EXECUTOR, options)).toMatchSnapshot()
        })

        it('should determine the rectangles for the iOS without a status and toolbar blockout', async () => {
            const options = {
                blockOutSideBar: false,
                blockOutStatusBar: false,
                blockOutToolBar: false,
                isAndroidNativeWebScreenshot: false,
                isHybridApp: false,
                isLandscape: false,
                isMobile: true,
                isViewPortScreenshot: true,
                platformName: 'iOS',
            }
            const MOCKED_EXECUTOR = jest
                .fn()
            // determineStatusAddressToolBarRectangles for: getIosStatusAddressToolBarOffsets
                .mockResolvedValueOnce({
                    sideBar: {
                        height: 240,
                        width: 120,
                        x: 0,
                        y: 70,
                    },
                    statusAddressBar: {
                        height: 94,
                        width: 375,
                        x: 0,
                        y: 0,
                    },
                    toolBar: {
                        height: 5,
                        width: 135,
                        x: 0,
                        y: 799,
                    },
                })

            expect(await determineStatusAddressToolBarRectangles(MOCKED_EXECUTOR, options)).toMatchSnapshot()
        })

        it('should determine the rectangles for Android with a status and toolbar blockout', async () => {
            const options = {
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroidNativeWebScreenshot: true,
                isHybridApp: false,
                isLandscape: false,
                isMobile: true,
                isViewPortScreenshot: true,
                platformName: 'Android',
            }
            const MOCKED_EXECUTOR = jest
                .fn()
            // determineStatusAddressToolBarRectangles for: getAndroidStatusAddressToolBarOffsets
                .mockResolvedValueOnce({
                    sideBar: {
                        height: 0,
                        width: 0,
                        x: 0,
                        y: 0,
                    },
                    statusAddressBar: {
                        height: 40,
                        width: 320,
                        x: 0,
                        y: 0,
                    },
                    toolBar: {
                        height: 100,
                        width: 320,
                        x: 0,
                        y: 600,
                    },
                })

            expect(await determineStatusAddressToolBarRectangles(MOCKED_EXECUTOR, options)).toMatchSnapshot()
        })

        it('should determine the rectangles that there are no rectangles for this device', async () => {
            const options = {
                blockOutSideBar: false,
                blockOutStatusBar: false,
                blockOutToolBar: false,
                isAndroidNativeWebScreenshot: false,
                isHybridApp: false,
                isLandscape: false,
                isMobile: true,
                isViewPortScreenshot: false,
                platformName: 'Android',
            }
            const MOCKED_EXECUTOR = jest
                .fn()
            // determineStatusAddressToolBarRectangles for: getAndroidStatusAddressToolBarOffsets
                .mockResolvedValueOnce({
                    statusAddressBar: {
                        height: 40,
                        width: 320,
                        x: 0,
                        y: 0,
                    },
                    toolBar: {
                        height: 100,
                        width: 320,
                        x: 0,
                        y: 600,
                    },
                })

            expect(await determineStatusAddressToolBarRectangles(MOCKED_EXECUTOR, options)).toMatchSnapshot()
        })
    })
})
