import type { BaseCoordinates, BaseDimensions } from '../base.interfaces.js'
import type { DeviceRectangles } from '../methods/rectangles.interfaces.js'

export interface GetAndCreatePathOptions {
    /** The name of the browser */
    browserName: string;
    /** The name of the device */
    deviceName: string;
    /** Is the instance a mobile */
    isMobile: boolean;
    /** If the folder needs to have the instance name in it */
    savePerInstance: boolean;
}

export interface FormatFileNameOptions {
    /** The browser name */
    browserName: string;
    /** The browser version */
    browserVersion: string;
    /** The device name */
    deviceName: string;
    /** The device pixel ratio */
    devicePixelRatio: number;
    /** The string that needs to be formatted */
    formatImageName: string;
    /** Is this a mobile */
    isMobile: boolean;
    /** Is the test executed in a browser */
    isTestInBrowser: boolean;
    /** The log name of the instance */
    logName: string;
    /** The the name of the instance */
    name: string;
    /** The outer height of the screen */
    outerHeight?: number;
    /** The outer width of the screen */
    outerWidth?: number;
    /** The platform name */
    platformName: string;
    /** The platform version */
    platformVersion: string;
    /** The height of the screen */
    screenHeight: number;
    /** The width of the screen */
    screenWidth: number;
    /** The tag of the image */
    tag: string;
}

export interface FormatFileDefaults extends BaseDimensions {
    /** The browser name */
    browserName: string;
    /** The browser version */
    browserVersion: string;
    /** The device name */
    deviceName: string;
    /** The device pixel ratio */
    dpr: number;
    /** The log name of the instance */
    logName: string;
    /** Add `app` or nothing */
    mobile: string;
    /** The the name of the instance */
    name: string;
    /** The platform name */
    platformName: string;
    /** The platform version */
    platformVersion: string;
    /** The tag of the image */
    tag: string;
}

export interface GetAddressBarShadowPaddingOptions {
    /** The browser name */
    browserName: string;
    /** Is the instance a android */
    isAndroid: boolean;
    /** Is the instance a iOS */
    isIOS: boolean;
    /** Is the instance a mobile */
    isMobile: boolean;
    /** Is this an instance that takes a native web screenshot */
    nativeWebScreenshot: boolean;
    /** The address bar shadow padding */
    addressBarShadowPadding: number;
    /** Add the padding */
    addShadowPadding: boolean;
}

export interface GetToolBarShadowPaddingOptions {
    /** Is the instance a android */
    isAndroid: boolean;
    /** Is the instance a iOS */
    isIOS: boolean;
    /** Is the instance a mobile */
    isMobile: boolean;
    /** The browser name */
    browserName: string;
    /** The tool bar shadow padding */
    toolBarShadowPadding: number;
    /** Add the padding */
    addShadowPadding: boolean;
}

export interface ScreenshotSize extends BaseDimensions {}

export interface GetMobileViewPortPositionOptions {
    /** The browser instance */
    browserInstance: WebdriverIO.Browser,
    /** The initial device rectangles */
    initialDeviceRectangles: DeviceRectangles,
    /** Is the context native */
    isNativeContext: boolean,
    /** Is the device Android */
    isAndroid: boolean,
    /** Is the device iOS */
    isIOS: boolean,
    /** Is this an instance that takes a native web screenshot */
    nativeWebScreenshot: boolean,
    /** The height of the screen */
    screenHeight: number,
    /** The width of the screen */
    screenWidth: number,
}

export interface GetMobileScreenSizeOptions {
    /** The browser instance */
    browserInstance: WebdriverIO.Browser,
    /** Is the device iOS */
    isIOS: boolean,
    /** Is the context native */
    isNativeContext: boolean,
}

export interface GetIosBezelImageNames {
    /** The name of the top image */
    topImageName: string;
    /** The name of the bottom image */
    bottomImageName: string;
}

export interface LoadBase64HtmlOptions {
    /** The browser instance */
    browserInstance: WebdriverIO.Browser;
    /** Is the device iOS */
    isIOS: boolean;
}

export interface ExecuteNativeClickOptions extends BaseCoordinates {
    /** The browser instance */
    browserInstance: WebdriverIO.Browser;
    /** Is the device iOS */
    isIOS: boolean;
}
