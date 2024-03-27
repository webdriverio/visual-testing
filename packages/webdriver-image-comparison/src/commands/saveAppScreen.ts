import type { Folders } from '../base.interfaces.js'
import type { AfterScreenshotOptions, ScreenshotOutput } from '../helpers/afterScreenshot.interfaces.js'
import afterScreenshot from '../helpers/afterScreenshot.js'
import { makeCroppedBase64Image } from '../methods/images.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { Methods } from '../methods/methods.interfaces.js'
import { takeBase64Screenshot } from '../methods/screenshots.js'
import type { SaveScreenOptions } from './screen.interfaces.js'

/**
 * Saves an image of the device screen for a native app
 */
export default async function saveAppScreen(
    methods: Methods,
    instanceData: InstanceData,
    folders: Folders,
    tag: string,
    saveScreenOptions: SaveScreenOptions,
    isNativeContext: boolean,
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
        deviceScreenSize,
        isIOS,
        isMobile,
        logName,
        platformName,
        platformVersion,
    } = instanceData

    // 2.  Take the screenshot
    let base64Image: string = await takeBase64Screenshot(methods.screenShot)

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
                height: isIOS ? deviceScreenSize.height * devicePixelRatio : deviceScreenSize.height,
                width: isIOS ? deviceScreenSize.width * devicePixelRatio : deviceScreenSize.width,
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
            screenHeight: deviceScreenSize.height,
            screenWidth: deviceScreenSize.width,
            tag,
        },
        isNativeContext,
        isLandscape:false,
        platformName,
    }

    // 5.  Return the data
    return afterScreenshot(methods.executor, afterOptions)
}
