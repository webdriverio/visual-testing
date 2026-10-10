import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { takeFullPageScreenshots } from '../methods/takeFullPageScreenshots.js'
import { makeFullPageBase64Image } from '../methods/images.js'
import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import type { FullPageScreenshotDataOptions } from '../methods/screenshots.interfaces.js'
import type { InternalSaveFullPageMethodOptions } from './save.interfaces.js'
import { getMethodOrWicOption, canUseBidiScreenshot } from '../helpers/utils.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'
import { determineWebFullPageIgnoreRegions, splitIgnores } from '../methods/rectangles.js'
import { readScrollPosition, restoreScrollPosition } from '../helpers/scrollPosition.js'

/**
 * Saves an image of the full page
 */
export default async function saveFullPageScreen(options: InternalSaveFullPageMethodOptions): Promise<ScreenshotOutput> {
    // 1. Check if the method is supported in native context
    if (options.isNativeContext) {
        throw new Error('The method saveFullPageScreen is not supported in native context for native mobile apps!')
    }

    // A full page screenshot that scrolls and stitches leaves the page at the bottom (#1231). Read the position
    // before the page is prepared (removed elements can make the page shorter and move it), and scroll back after
    // the page is restored, also when the screenshot fails
    const startScrollPosition = await readScrollPosition(options.browserInstance)
    try {
        return await takeFullPageScreen(options)
    } finally {
        await restoreScrollPosition(options.browserInstance, startScrollPosition, options.instanceData.isIOS)
    }
}

async function takeFullPageScreen(
    {
        browserInstance,
        instanceData,
        folders,
        tag,
        saveFullPageOptions,
    }: InternalSaveFullPageMethodOptions
): Promise<ScreenshotOutput> {
    // 2. Set some variables
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'enableLegacyScreenshotMethod')
    const fullPageScrollTimeout = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'fullPageScrollTimeout')
    const hideAfterFirstScroll: HTMLElement[] = saveFullPageOptions.method.hideAfterFirstScroll || []
    const userBasedFullPageScreenshot = getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'userBasedFullPageScreenshot')
    // A page where a container scrolls and not the page (#125)
    const scrollContainer = saveFullPageOptions.method.scrollContainer ? await saveFullPageOptions.method.scrollContainer : undefined
    const ignore = saveFullPageOptions.method?.ignore

    // 3.  Prepare the screenshot
    const defaultBeforeOptions = createBeforeScreenshotOptions(instanceData, saveFullPageOptions.method, saveFullPageOptions.wic)
    // On mobile, the body gets a padding for the shadows of the address bar and of the toolbar. In an app where a
    // container scrolls, the body has the height of the viewport, so the padding would cut the end of the container
    const beforeOptions = scrollContainer
        ? { ...defaultBeforeOptions, addressBarShadowPadding: 0, toolBarShadowPadding: 0 }
        : defaultBeforeOptions
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(browserInstance, beforeOptions, true)
    const {
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                isEmulated: _isEmulated,
                isLandscape,
                screenHeight,
                screenWidth,
            },
        },
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isMobile,
    } = enrichedInstanceData

    // 4.  Take the screenshot
    const fullPageScreenshotOptions: FullPageScreenshotDataOptions = {
        addressBarShadowPadding: beforeOptions.addressBarShadowPadding,
        devicePixelRatio: devicePixelRatio || NaN,
        deviceRectangles: instanceData.deviceRectangles,
        fullPageScrollTimeout,
        hideAfterFirstScroll,
        hideScrollBars: beforeOptions.noScrollBars,
        innerHeight: innerHeight || NaN,
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isLandscape,
        screenHeight: screenHeight || NaN,
        screenWidth: screenWidth || NaN,
        scrollContainer,
        toolBarShadowPadding: beforeOptions.toolBarShadowPadding,
        // With a scroll container, the ignore elements are measured at each screenshot: the layout and the scroll
        // position of the container change, and a sticky element can be in more than one screenshot
        ...(scrollContainer && ignore && ignore.length > 0 ? { ignoreElements: splitIgnores(await Promise.all(ignore)).elements } : {}),
    }
    // A BiDi screenshot of the document does not show the content of a scroll container, so scroll and stitch
    const shouldUseBidi = canUseBidiScreenshot(browserInstance) && !scrollContainer && (!userBasedFullPageScreenshot || !enableLegacyScreenshotMethod)
    const screenshotsData = await takeFullPageScreenshots(browserInstance, fullPageScreenshotOptions, shouldUseBidi)

    // 5.  Get the final image - either direct BiDi or stitched from multiple screenshots
    const fullPageBase64Image = (screenshotsData.fullPageHeight === -1 && screenshotsData.fullPageWidth === -1)
        ? screenshotsData.data[0].screenshot // BiDi screenshot - use directly
        : await makeFullPageBase64Image(screenshotsData, { devicePixelRatio: devicePixelRatio || NaN, isLandscape })

    // 6. Resolve ignore regions while the DOM is still in screenshot state.
    //    Full-page image (BiDi or stitched) is in document coordinates; regions are document-relative device pixels.
    //    On mobile scroll-and-stitch we crop addressBarShadowPadding from the top of each tile, so we pass
    //    fullPageCropTopPaddingCSS so ignore regions align with the stitched canvas.
    const ignoreRegionPadding = (getMethodOrWicOption(saveFullPageOptions.method, saveFullPageOptions.wic, 'ignoreRegionPadding') as number | undefined) ?? 1
    const usedStitchedMobile = isMobile && !scrollContainer && !(screenshotsData.fullPageHeight === -1 && screenshotsData.fullPageWidth === -1)
    const ignoreRegions = ignore && ignore.length > 0
        ? await determineWebFullPageIgnoreRegions(
            {
                browserInstance,
                devicePixelRatio: devicePixelRatio || 1,
                fullPageCropTopPaddingCSS: usedStitchedMobile ? beforeOptions.addressBarShadowPadding : 0,
                ignoreRegionPadding,
                elementRegions: screenshotsData.elementRegions,
            },
            ignore,
        )
        : undefined

    // 7.  Return the data
    const afterOptions = buildAfterScreenshotOptions({
        base64Image: fullPageBase64Image,
        folders,
        tag,
        isNativeContext: false,
        instanceData,
        enrichedInstanceData,
        beforeOptions,
        wicOptions: saveFullPageOptions.wic
    })

    const result = await afterScreenshot(browserInstance, afterOptions!)

    return {
        ...result,
        ...(ignoreRegions ? { ignoreRegions } : {}),
    }
}
