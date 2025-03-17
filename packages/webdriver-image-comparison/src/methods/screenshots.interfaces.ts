import type { DeviceRectangles } from './instanceData.interfaces.js'
import type { Executor, TakeElementScreenshot, TakeScreenShot } from './methods.interfaces.js'
import type { RectanglesOutput } from './rectangles.interfaces.js'

export interface FullPageScreenshotsData {
    // The height of the full page
    fullPageHeight: number;
    // The width of the full page
    fullPageWidth: number;
    data: ScreenshotData[];
}

interface ScreenshotData {
    // The width of the canvas
    canvasWidth: number;
    // The y position on the  canvas
    canvasYPosition: number;
    // The height if the image
    imageHeight: number;
    // The width of the image
    imageWidth: number;
    // The x position in the image to start from
    imageXPosition: number;
    // The y position in the image to start from
    imageYPosition: number;
    // The screenshot itself
    screenshot: string;
}

export interface FullPageScreenshotDataOptions {
    // The address bar padding for iOS or Android
    addressBarShadowPadding: number;
    // The device pixel ratio
    devicePixelRatio: number;
    // The amount of milliseconds to wait for a new scroll
    fullPageScrollTimeout: number;
    // Elements that need to be hidden after the first scroll for a fullpage scroll
    hideAfterFirstScroll: (HTMLElement | HTMLElement[])[];
    // The inner height
    innerHeight: number;
    // If the instance is an Android device
    isAndroid: boolean;
    // If this is an Android native screenshot
    isAndroidNativeWebScreenshot: boolean;
    // If this is an Android ChromeDriver screenshot
    isAndroidChromeDriverScreenshot: boolean;
    // Is it an hybrid app or not
    isHybridApp: boolean;
    // If the instance is an iOS device
    isIOS: boolean;
    // If it's landscape or not
    isLandscape: boolean;
    // Height of the screen
    screenHeight: number;
    // Width of the screen
    screenWidth: number;
    // The address bar padding for iOS or Android
    toolBarShadowPadding: number;
}

export interface FullPageScreenshotNativeMobileOptions {
    // The address bar padding for iOS or Android
    addressBarShadowPadding: number;
    // The device pixel ratio
    devicePixelRatio: number;
    // The amount of milliseconds to wait for a new scroll
    fullPageScrollTimeout: number;
    // Elements that need to be hidden after the first scroll for a fullpage scroll
    hideAfterFirstScroll: (HTMLElement | HTMLElement[])[];
    // Position of the home bar for iOS
    iosHomeBarY?: number;
    // If the device is in landscape mode
    isLandscape?: boolean;
    // The innerheight
    innerHeight: number;
    // The size of the safe area for iOS
    safeArea: number;
    // The height of the status and the address bar
    statusAddressBarHeight: number;
    // The address bar padding for iOS or Android
    toolBarShadowPadding: number;
    // Height of the screen
    screenHeight: number;
    // Width of the screen
    screenWidth: number;
    // When iOS is in landscape mode and it's an iPad there will be a side bar
    sideBarWidth: number;
}

export interface FullPageScreenshotOptions {
    // The device pixel ratio
    devicePixelRatio: number;
    // The timeout to wait after a scroll
    fullPageScrollTimeout: number;
    // The innerheight
    innerHeight: number;
    // Elements that need to be hidden after the first scroll for a fullpage scroll
    hideAfterFirstScroll: (HTMLElement | HTMLElement[])[];
}

export interface TakeWebElementScreenshot {
    devicePixelRatio?: number,
    deviceRectangles: DeviceRectangles,
    element: any,
    executor: Executor,
    fallback?: boolean,
    innerHeight?: number,
    isAndroidNativeWebScreenshot: boolean,
    isAndroid: boolean,
    isIOS: boolean,
    isLandscape: boolean,
    screenShot:TakeScreenShot,
    takeElementScreenshot?: TakeElementScreenshot,
}

export interface TakeWebElementScreenshotData {
    base64Image: string;
    isWebDriverElementScreenshot: boolean;
    rectangles: RectanglesOutput;
}
