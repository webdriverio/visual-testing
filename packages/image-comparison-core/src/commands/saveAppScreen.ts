import type { ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import { takeBase64Screenshot } from '../methods/screenshots.js'
import { buildAfterScreenshotOptions } from '../helpers/options.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'

/**
 * Saves an image of the device screen for a native app
 */
export default async function saveAppScreen(
    {
        browserInstance,
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext = true,
    }: InternalSaveScreenMethodOptions
): Promise<ScreenshotOutput> {
    // 1. Set some variables
    const { addIOSBezelCorners } = saveScreenOptions.wic
    const { deviceName, devicePixelRatio, deviceRectangles: { screenSize }, isIOS } = instanceData

    // 2a.  Take the screenshot
    let base64Image: string = await takeBase64Screenshot(browserInstance)

    // 2b.  We only need to use the `makeCroppedBase64Image` for iOS and when `addIOSBezelCorners` is true
    if (isIOS && addIOSBezelCorners) {
        base64Image = await makeCroppedBase64Image({
            addIOSBezelCorners,
            base64Image,
            deviceName,
            devicePixelRatio,
            isIOS,
            // @TODO: is this one needed for native apps?
            isLandscape: false,
            rectangles :{
                // For iOS the screen size is always in css pixels, the screenshot is in device pixels
                height: screenSize.height * devicePixelRatio,
                width: screenSize.width * devicePixelRatio,
                x: 0,
                y: 0,
            },
        })
    }

    // 3.  Return the data
    const afterOptions = buildAfterScreenshotOptions({
        base64Image,
        folders,
        tag,
        isNativeContext,
        instanceData,
        wicOptions: saveScreenOptions.wic
    })

    return afterScreenshot(browserInstance, afterOptions)
}
