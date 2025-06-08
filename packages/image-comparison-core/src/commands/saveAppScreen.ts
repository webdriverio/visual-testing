import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import { takeBase64Screenshot } from '../methods/screenshots.js'
import type { InternalSaveScreenMethodOptions } from './save.interfaces.js'

/**
 * Saves an image of the device screen for a native app
 */
export default async function saveAppScreen(
    {
        instanceData,
        folders,
        tag,
        saveScreenOptions,
        isNativeContext = true,
    }: InternalSaveScreenMethodOptions
): Promise<ScreenshotOutput> {
    // 1. Set some variables
    const {
        addIOSBezelCorners,
        formatImageName,
        savePerInstance,
    } = saveScreenOptions.wic
    const {
        browserName,
        browserVersion,
        deviceName,
        devicePixelRatio,
        deviceRectangles: { screenSize },
        isIOS,
        isMobile,
        logName,
        platformName,
        platformVersion,
    } = instanceData

    // 2.  Take the screenshot
    let base64Image: string = await takeBase64Screenshot()

    // 3.  We only need to use the `makeCroppedBase64Image` for iOS and when `addIOSBezelCorners` is true
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
                height: isIOS ? screenSize.height * devicePixelRatio : screenSize.height,
                width: isIOS ? screenSize.width * devicePixelRatio : screenSize.width,
                x: 0,
                y: 0,
            },
        })
    }

    // 4.  The after the screenshot methods
    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image,
        filePath: {
            browserName,
            deviceName,
            isMobile,
            savePerInstance,
        },
        fileName: {
            browserName,
            browserVersion,
            deviceName,
            devicePixelRatio: devicePixelRatio,
            formatImageName,
            isMobile,
            isTestInBrowser: !isNativeContext,
            logName,
            name: '',
            platformName,
            platformVersion,
            screenHeight: screenSize.height,
            screenWidth: screenSize.width,
            tag,
        },
        isNativeContext,
        isLandscape:false,
        platformName,
    }

    // 5.  Return the data
    return afterScreenshot(afterOptions)
}
