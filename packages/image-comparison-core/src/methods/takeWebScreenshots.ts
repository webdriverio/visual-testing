import { takeBase64BiDiScreenshot, takeBase64Screenshot } from './screenshots.js'
import { makeCroppedBase64Image } from './images.js'
import { determineScreenRectangles } from './rectangles.js'
import type { WebScreenshotDataOptions, WebScreenshotData } from './screenshots.interfaces.js'
import type { ScreenRectanglesOptions } from './rectangles.interfaces.js'

export async function takeWebScreenshot(
    browserInstance: WebdriverIO.Browser,
    options: WebScreenshotDataOptions,
    shouldUseBidi: boolean = false
): Promise<WebScreenshotData> {
    let base64Image: string

    if (shouldUseBidi) {
        // Take the screenshot with the BiDi method
        base64Image = await takeBase64BiDiScreenshot({ browserInstance })
    } else {
        // Take the screenshot with the regular method
        base64Image = await takeBase64Screenshot(browserInstance)

        // Determine the rectangles
        const screenRectangleOptions: ScreenRectanglesOptions = {
            devicePixelRatio: options.devicePixelRatio || NaN,
            enableLegacyScreenshotMethod: options.enableLegacyScreenshotMethod,
            innerHeight: options.innerHeight || NaN,
            innerWidth: options.innerWidth || NaN,
            isAndroidChromeDriverScreenshot: options.isAndroidChromeDriverScreenshot,
            isAndroidNativeWebScreenshot: options.isAndroidNativeWebScreenshot,
            isEmulated: options.isEmulated || false,
            initialDevicePixelRatio: options.initialDevicePixelRatio || NaN,
            isIOS: options.isIOS,
            isLandscape: options.isLandscape,
        }
        const rectangles = determineScreenRectangles(base64Image, screenRectangleOptions)

        // Make a cropped base64 image
        base64Image = await makeCroppedBase64Image({
            addIOSBezelCorners: options.addIOSBezelCorners,
            base64Image,
            deviceName: options.deviceName,
            devicePixelRatio: options.devicePixelRatio || NaN,
            isIOS: options.isIOS,
            isLandscape: options.isLandscape,
            rectangles,
        })
    }

    return {
        base64Image,
    }
}
