import { takeElementScreenshot } from '../methods/takeElementScreenshots.js'
import beforeScreenshot from '../helpers/beforeScreenshot.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import type { BeforeScreenshotResult } from '../helpers/beforeScreenshot.interfaces.js'
import { DEFAULT_RESIZE_DIMENSIONS } from '../helpers/constants.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import type { ElementScreenshotDataOptions } from '../methods/screenshots.interfaces.js'
import { canUseBidiScreenshot, getMethodOrWicOption } from '../helpers/utils.js'
import { createBeforeScreenshotOptions, buildAfterScreenshotOptions } from '../helpers/options.js'
import type { InternalSaveElementMethodOptions } from './save.interfaces.js'
import { determineWebElementIgnoreRegions } from '../methods/rectangles.js'

/**
 * Saves an image of an element
 */
export default async function saveWebElement(
    {
        browserInstance,
        instanceData,
        folders,
        element,
        tag,
        ignore,
        saveElementOptions,
    }: InternalSaveElementMethodOptions
): Promise<ScreenshotOutput> {
    // 1. Set some variables
    const { addressBarShadowPadding, autoElementScroll } = saveElementOptions.wic
    const enableLegacyScreenshotMethod = getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'enableLegacyScreenshotMethod')
    const resizeDimensions: ResizeDimensions | number = saveElementOptions.method.resizeDimensions || DEFAULT_RESIZE_DIMENSIONS

    // 2.  Prepare the screenshot
    const beforeOptions = createBeforeScreenshotOptions(instanceData, saveElementOptions.method, saveElementOptions.wic)
    const enrichedInstanceData: BeforeScreenshotResult = await beforeScreenshot(browserInstance, beforeOptions, true)
    const {
        deviceName,
        dimensions: {
            window: {
                devicePixelRatio,
                innerHeight,
                isEmulated,
                isLandscape,
            },
        },
        initialDevicePixelRatio,
        isAndroid,
        isAndroidChromeDriverScreenshot,
        isAndroidNativeWebScreenshot,
        isIOS,
        isMobile,
    } = enrichedInstanceData

    // 3. Take the screenshot
    const elementScreenshotOptions: ElementScreenshotDataOptions = {
        addressBarShadowPadding,
        autoElementScroll,
        deviceName,
        devicePixelRatio: devicePixelRatio || 1,
        deviceRectangles: instanceData.deviceRectangles,
        element,
        isEmulated,
        initialDevicePixelRatio: initialDevicePixelRatio || 1,
        innerHeight,
        isAndroidNativeWebScreenshot,
        isAndroidChromeDriverScreenshot,
        isAndroid,
        isIOS,
        isLandscape,
        isMobile,
        resizeDimensions,
        toolBarShadowPadding: beforeOptions.toolBarShadowPadding,
    }
    const shouldUseBidi = canUseBidiScreenshot(browserInstance) && !isMobile && !enableLegacyScreenshotMethod
    const screenshotData = await takeElementScreenshot(browserInstance, elementScreenshotOptions, shouldUseBidi)

    // 3b. Resolve ignore regions (element-local, in device pixels) while the DOM
    // is still in screenshot state.
    const ignoreRegionPadding = (getMethodOrWicOption(saveElementOptions.method, saveElementOptions.wic, 'ignoreRegionPadding') as number | undefined) ?? 1
    const ignoreRegions = ignore && ignore.length > 0
        ? await (async () => {
            const rootElement = await (element as any as WebdriverIO.Element | Promise<WebdriverIO.Element>)

            return determineWebElementIgnoreRegions(
                {
                    browserInstance,
                    devicePixelRatio: devicePixelRatio || 1,
                    rootElement: rootElement as WebdriverIO.Element,
                    ignoreRegionPadding,
                },
                ignore,
            )
        })()
        : undefined

    // 4. Return the data
    const afterOptions = buildAfterScreenshotOptions({
        base64Image: screenshotData.base64Image,
        folders,
        tag,
        isNativeContext: false,
        instanceData,
        enrichedInstanceData,
        beforeOptions,
        wicOptions: saveElementOptions.wic
    })

    const result = await afterScreenshot(browserInstance, afterOptions)

    return {
        ...result,
        ...(ignoreRegions ? { ignoreRegions } : {}),
    }
}
