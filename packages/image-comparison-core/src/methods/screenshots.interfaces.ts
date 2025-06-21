import type { DeviceRectangles } from './rectangles.interfaces.js'
import type { RectanglesOutput } from './rectangles.interfaces.js'

/**
 * Interface representing data for full page screenshots.
 */
export interface FullPageScreenshotsData {
    /** The height of the full page. */
    fullPageHeight: number;
    /** The width of the full page. */
    fullPageWidth: number;
    /** Array of screenshot data. */
    data: ScreenshotData[];
}

/**
 * Interface representing individual screenshot data.
 */
interface ScreenshotData {
    /** The width of the canvas. */
    canvasWidth: number;
    /** The y position on the canvas. */
    canvasYPosition: number;
    /** The height of the image. */
    imageHeight: number;
    /** The width of the image. */
    imageWidth: number;
    /** The x position in the image to start from. */
    imageXPosition: number;
    /** The y position in the image to start from. */
    imageYPosition: number;
    /** The screenshot itself. */
    screenshot: string;
}

/**
 * Interface representing options for full page screenshot data.
 */
export interface FullPageScreenshotDataOptions {
    /** The address bar padding for iOS or Android. */
    addressBarShadowPadding: number;
    /** The device pixel ratio. */
    devicePixelRatio: number;
    /** The rectangles of the device. */
    deviceRectangles: DeviceRectangles;
    /** The amount of milliseconds to wait for a new scroll. */
    fullPageScrollTimeout: number;
    /** Elements that need to be hidden after the first scroll for a fullpage scroll. */
    hideAfterFirstScroll: (HTMLElement | HTMLElement[])[];
    /** The inner height. */
    innerHeight: number;
    /** If the instance is an Android device. */
    isAndroid: boolean;
    /** If this is an Android native screenshot. */
    isAndroidNativeWebScreenshot: boolean;
    /** If this is an Android ChromeDriver screenshot. */
    isAndroidChromeDriverScreenshot: boolean;
    /** If the instance is an iOS device. */
    isIOS: boolean;
    /** If it's landscape or not. */
    isLandscape: boolean;
    /** Height of the screen. */
    screenHeight: number;
    /** Width of the screen. */
    screenWidth: number;
    /** The address bar padding for iOS or Android. */
    toolBarShadowPadding: number;
}

/**
 * Interface representing options for full page screenshot on native mobile.
 */
export interface FullPageScreenshotNativeMobileOptions {
    /** The address bar padding for iOS or Android. */
    addressBarShadowPadding: number;
    /** The device pixel ratio. */
    devicePixelRatio: number;
    /** The rectangles of the device. */
    deviceRectangles: DeviceRectangles;
    /** The amount of milliseconds to wait for a new scroll. */
    fullPageScrollTimeout: number;
    /** Elements that need to be hidden after the first scroll for a fullpage scroll. */
    hideAfterFirstScroll: (HTMLElement | HTMLElement[])[];
    /** If it's an Android device. */
    isAndroid: boolean;
    /** If the device is in landscape mode. */
    isLandscape?: boolean;
    /** The inner height. */
    innerHeight: number;
    /** The address bar padding for iOS or Android. */
    toolBarShadowPadding: number;
    /** Width of the screen. */
    screenWidth: number;
}

/**
 * Interface representing options for full page screenshot.
 */
export interface FullPageScreenshotOptions {
    /** The device pixel ratio. */
    devicePixelRatio: number;
    /** The timeout to wait after a scroll. */
    fullPageScrollTimeout: number;
    /** The inner height. */
    innerHeight: number;
    /** Elements that need to be hidden after the first scroll for a fullpage scroll. */
    hideAfterFirstScroll: (HTMLElement | HTMLElement[])[];
}

/**
 * Interface representing options for taking a web element screenshot.
 */
export interface TakeWebElementScreenshot {
    /** The browser instance. */
    browserInstance: WebdriverIO.Browser;
    /** The device pixel ratio. */
    devicePixelRatio?: number;
    /** The rectangles of the device. */
    deviceRectangles: DeviceRectangles;
    /** The element to take a screenshot of. */
    element: any;
    /** Whether to use a fallback method. */
    fallback?: boolean;
    /** The initial device pixel ratio. */
    initialDevicePixelRatio: number;
    /** Whether the device is emulated. */
    isEmulated: boolean;
    /** The inner height. */
    innerHeight?: number;
    /** Whether this is an Android native web screenshot. */
    isAndroidNativeWebScreenshot: boolean;
    /** Whether the instance is an Android device. */
    isAndroid: boolean;
    /** Whether the instance is an iOS device. */
    isIOS: boolean;
    /** Whether it's landscape or not. */
    isLandscape: boolean;
}

/**
 * Interface representing data for taking a web element screenshot.
 */
export interface TakeWebElementScreenshotData {
    /** The base64 encoded image. */
    base64Image: string;
    /** Whether this is a web driver element screenshot. */
    isWebDriverElementScreenshot: boolean;
    /** The rectangles output. */
    rectangles: RectanglesOutput;
}
