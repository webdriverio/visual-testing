import type { DeviceRectangles, RectanglesOutput } from './rectangles.interfaces.js'

// === UNIVERSAL BASE INTERFACES ===

/**
 * Universal screenshot information that applies to ALL screenshot scenarios.
 * This includes desktop browsers on high-DPI displays, mobile browsers, and native apps.
 */
export interface ScreenshotInfo {
    /** The device pixel ratio. */
    devicePixelRatio: number;
    /** The initial device pixel ratio. */
    initialDevicePixelRatio?: number;
}

/**
 * Base device information shared across screenshot operations.
 */
export interface DeviceInfo {
    /** Whether the instance is an Android device. */
    isAndroid: boolean;
    /** Whether the instance is an iOS device. */
    isIOS: boolean;
    /** Whether it's landscape or not. */
    isLandscape: boolean;
}

/**
 * Viewport information.
 */
export interface ViewportInfo {
    /** The inner height. */
    innerHeight: number;
    /** The inner width. */
    innerWidth?: number;
    /** Height of the screen. */
    screenHeight?: number;
    /** Width of the screen. */
    screenWidth?: number;
}

// === PLATFORM-SPECIFIC INTERFACES ===

/**
 * Android-specific screenshot options.
 */
export interface AndroidScreenshotOptions {
    /** Whether this is an Android native web screenshot. */
    isAndroidNativeWebScreenshot: boolean;
    /** Whether this is an Android ChromeDriver screenshot. */
    isAndroidChromeDriverScreenshot: boolean;
}

/**
 * iOS-specific screenshot options.
 */
export interface IOSScreenshotOptions {
    /** Whether to add iOS bezel corners. */
    addIOSBezelCorners: boolean;
}

// === MOBILE-SPECIFIC INTERFACES ===

/**
 * Mobile device information.
 */
export interface MobileDeviceInfo extends DeviceInfo {
    /** The device name. */
    deviceName: string;
    /** Whether this is a mobile device. */
    isMobile: boolean;
    /** Whether the device is emulated. */
    isEmulated: boolean;
}

/**
 * Mobile cropping options for converting full screen to viewport screenshots.
 */
export interface MobileCroppingOptions {
    /** The address bar padding for iOS or Android. */
    addressBarShadowPadding: number;
    /** The toolbar padding for iOS or Android. */
    toolBarShadowPadding: number;
    /** The rectangles of the device. */
    deviceRectangles: DeviceRectangles;
}

/**
 * Scroll options for full page screenshots.
 */
export interface ScrollOptions {
    /** The amount of milliseconds to wait for a new scroll. */
    fullPageScrollTimeout: number;
    /** Elements that need to be hidden after the first scroll for a fullpage scroll. */
    hideAfterFirstScroll: (HTMLElement | HTMLElement[])[];
}

// === DATA STRUCTURES ===

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
 * Base interface for screenshot data results.
 */
export interface BaseScreenshotData {
    /** The base64 encoded image. */
    base64Image: string;
}

/**
 * Interface representing data for web screen screenshot result.
 */
export interface WebScreenshotData extends BaseScreenshotData {
    // Only contains base64Image from base
}

/**
 * Interface representing data for element screenshot result.
 */
export interface ElementScreenshotData extends BaseScreenshotData {
    /** Whether this is a web driver element screenshot. */
    isWebDriverElementScreenshot: boolean;
}

/**
 * Interface representing data for taking a web element screenshot.
 */
export interface TakeWebElementScreenshotData extends BaseScreenshotData {
    /** Whether this is a web driver element screenshot. */
    isWebDriverElementScreenshot: boolean;
    /** The rectangles output. */
    rectangles: RectanglesOutput;
}

// === OPTIONS INTERFACES ===

/**
 * Interface representing options for full page screenshot data.
 */
export interface FullPageScreenshotDataOptions extends
    ScreenshotInfo,
    DeviceInfo,
    AndroidScreenshotOptions,
    ViewportInfo,
    MobileCroppingOptions,
    ScrollOptions {
    /** Height of the screen. */
    screenHeight: number;
    /** Width of the screen. */
    screenWidth: number;
}

/**
 * Interface representing options for full page screenshot on native mobile.
 */
export interface FullPageScreenshotNativeMobileOptions extends
    ScreenshotInfo,
    DeviceInfo,
    ViewportInfo,
    MobileCroppingOptions,
    ScrollOptions {
    /** Width of the screen. */
    screenWidth: number;
}

/**
 * Interface representing options for full page screenshot.
 */
export interface FullPageScreenshotOptions extends
    ScreenshotInfo,
    ViewportInfo,
    ScrollOptions {
    // Extends base interfaces only
}

/**
 * Interface representing options for taking a web element screenshot.
 */
export interface TakeWebElementScreenshot extends
    ScreenshotInfo,
    DeviceInfo,
    AndroidScreenshotOptions,
    MobileCroppingOptions {
    /** The browser instance. */
    browserInstance: WebdriverIO.Browser;
    /** The element to take a screenshot of. */
    element: any;
    /** Whether to use a fallback method. */
    fallback?: boolean;
    /** Whether the device is emulated. */
    isEmulated: boolean;
    /** The inner height. */
    innerHeight?: number;
}

/**
 * Interface representing options for web screen screenshot data.
 */
export interface WebScreenshotDataOptions extends
    ScreenshotInfo,
    MobileDeviceInfo,
    AndroidScreenshotOptions,
    IOSScreenshotOptions {
    /** Whether to enable legacy screenshot method. */
    enableLegacyScreenshotMethod: boolean;
    /** The inner height. */
    innerHeight?: number;
    /** The inner width. */
    innerWidth?: number;
}

/**
 * Interface representing options for element screenshot data.
 */
export interface ElementScreenshotDataOptions extends
    ScreenshotInfo,
    MobileDeviceInfo,
    AndroidScreenshotOptions,
    MobileCroppingOptions {
    /** Whether to automatically scroll the element into view. */
    autoElementScroll: boolean;
    /** The element to take a screenshot of. */
    element: any;
    /** The inner height. */
    innerHeight?: number;
    /** Resize dimensions for the screenshot. */
    resizeDimensions: any;
}
