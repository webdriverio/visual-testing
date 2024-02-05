import { describe, it, expect, vi } from 'vitest'
import { getBase64FullPageScreenshotsData } from './screenshots.js'
import type { FullPageScreenshotDataOptions } from './screenshots.interfaces'
import { IMAGE_STRING } from '../mocks/mocks.js'
import { LogLevel } from '../helpers/options.interfaces'

describe('screenshots', () => {
    describe('getBase64FullPageScreenshotsData', () => {
        const MOCKED_TAKESCREENSHOT = vi.fn().mockResolvedValue(IMAGE_STRING)

        it('should get the Android nativeWebScreenshot fullpage screenshot data', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 800,
                isAndroid: true,
                isAndroidNativeWebScreenshot: true,
                isAndroidChromeDriverScreenshot: false,
                isHybridApp: false,
                isIOS: false,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // For await executor(getAndroidStatusAddressToolBarOffsets, OFFSETS.ANDROID))
                .mockResolvedValueOnce({
                    isLandscape: false,
                    safeArea: 0,
                    statusAddressBar: { height: 56 },
                    screenHeight: 768,
                    screenWidth: 1366,
                    sideBar: { width: 0 },
                })
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(788)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should get hide elements for the Android nativeWebScreenshot fullpage screenshot', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 600,
                isAndroid: true,
                isAndroidNativeWebScreenshot: true,
                isAndroidChromeDriverScreenshot: false,
                isHybridApp: false,
                isIOS: false,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [<HTMLElement>(<unknown>'<div/>')],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // For await executor(getAndroidStatusAddressToolBarOffsets, OFFSETS.ANDROID))
                .mockResolvedValueOnce({
                    isLandscape: false,
                    safeArea: 0,
                    statusAddressBar: { height: 56 },
                    screenHeight: 768,
                    screenWidth: 1366,
                    sideBar: { width: 0 },
                })
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(788)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(788)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should get the Android ChromeDriver fullpage screenshot data', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 800,
                isAndroid: true,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: true,
                isHybridApp: false,
                isIOS: false,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should hide elements for the Android ChromeDriver fullpage screenshot', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 800,
                isAndroid: true,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: true,
                isHybridApp: false,
                isIOS: false,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [<HTMLElement>(<unknown>'<div/>')],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should get the iOS fullpage screenshot data', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 800,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: false,
                isHybridApp: false,
                isIOS: true,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                .mockResolvedValueOnce({
                    isLandscape: false,
                    safeArea: 44,
                    screenHeight: 768,
                    screenWidth: 1366,
                    sideBar: { width: 0 },
                    statusAddressBar: { height: 94 },
                    toolBar: { y: 329 },
                })
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should get the iOS fullpage screenshot data for a landscape iPad', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 400,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: false,
                isHybridApp: false,
                isIOS: true,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                .mockResolvedValueOnce({
                    isLandscape: true,
                    safeArea: 0,
                    screenHeight: 384,
                    screenWidth: 683,
                    sideBar: { width: 160 },
                    statusAddressBar: { height: 47 },
                    toolBar: { y: 75 },
                })
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(600)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(600)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should hide elements for the iOS fullpage screenshot', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 800,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: false,
                isHybridApp: false,
                isIOS: true,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [<HTMLElement>(<unknown>'<div/>')],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // getBase64FullPageScreenshotsData: For await executor(getIosStatusAddressToolBarOffsets)
                .mockResolvedValueOnce({
                    isLandscape: false,
                    safeArea: 44,
                    screenHeight: 768,
                    screenWidth: 1366,
                    sideBar: { width: 0 },
                    statusAddressBar: { height: 94 },
                    toolBar: { y: 329 },
                })
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(1200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideScrollBars, false);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should get the desktop browser fullpage screenshot data', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 768,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: false,
                isHybridApp: false,
                isIOS: false,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 3
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 4
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 5
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })

        it('should hide elements for the desktop browser fullpage screenshot', async () => {
            const options: FullPageScreenshotDataOptions = {
                addressBarShadowPadding: 6,
                devicePixelRatio: 2,
                fullPageScrollTimeout: 1,
                innerHeight: 768,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isAndroidChromeDriverScreenshot: false,
                isHybridApp: false,
                isIOS: false,
                isLandscape: false,
                logLevel: LogLevel.debug,
                toolBarShadowPadding: 6,
                hideAfterFirstScroll: [<HTMLElement>(<unknown>'<div/>')],
                screenHeight: 0,
                screenWidth: 0,
            }
            const MOCKED_EXECUTOR = vi
                .fn()
                // THIS NEEDS TO BE FIXED IN THE FUTURE
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 2
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, true);
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 3
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 4
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // RUN 5
                // getFullPageScreenshotsDataNativeMobile: For await executor(scrollToPosition, scrollY)
                .mockResolvedValueOnce({})
                // getFullPageScreenshotsDataNativeMobile: For await executor(getDocumentScrollHeight)
                .mockResolvedValueOnce(3200)
                // getFullPageScreenshotsDataNativeMobile: For await executor(hideRemoveElements, {hide: hideAfterFirstScroll, remove: []}, false);
                .mockResolvedValueOnce({})

            // Replace the screenshot with a `mocked-screenshot-string`;
            const result = await getBase64FullPageScreenshotsData(MOCKED_TAKESCREENSHOT, MOCKED_EXECUTOR, options)
            result.data.forEach((dataObject) => (dataObject.screenshot = 'mocked-screenshot-string'))

            expect(result).toMatchSnapshot()
        })
    })
})
