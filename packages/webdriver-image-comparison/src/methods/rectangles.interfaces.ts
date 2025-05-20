import type { Executor } from './methods.interfaces.js'

export interface RectanglesOptions {
    /** The device pixel ration of the screen / device */
    devicePixelRatio: number;
    /** If this is an Android native screenshot */
    isAndroidNativeWebScreenshot: boolean;
    /** The inner height of a screen */
    innerHeight: number;
    /** If this is an iOS device */
    isIOS: boolean;
}

export interface ElementRectanglesOptions extends RectanglesOptions {
    /** The device rectangles */
    deviceRectangles: DeviceRectangles;
    /** If this is an Android device */
    isAndroid: boolean;
}

export interface ScreenRectanglesOptions extends RectanglesOptions {
    /** If the legacy screenshot method is enabled */
    enableLegacyScreenshotMethod: boolean;
    /** The inner height */
    innerWidth: number;
    /** If this is an Android ChromeDriver screenshot */
    isAndroidChromeDriverScreenshot: boolean;
    /** The initial devicePixelRatio of the instance */
    initialDevicePixelRatio: number;
    /** If the screen is emulated */
    isEmulated: boolean;
    /** If it's landscape */
    isLandscape: boolean;
}

export interface RectanglesOutput {
    height: number;
    width: number;
    x: number;
    y: number;
}

export type DeviceRectangles = {
    bottomBar: RectanglesOutput,
    homeBar: RectanglesOutput,
    leftSidePadding: RectanglesOutput,
    rightSidePadding: RectanglesOutput,
    screenSize: { height: number, width: number},
    statusBarAndAddressBar: RectanglesOutput,
    statusBar: RectanglesOutput,
    viewport: RectanglesOutput,
}

export interface StatusAddressToolBarRectanglesOptions {
    /** If the side bar needs to be blocked out */
    blockOutSideBar: boolean;
    /** If the status and address bar needs to be blocked out */
    blockOutStatusBar: boolean;
    /** If the tool bar needs to be blocked out */
    blockOutToolBar: boolean;
    /** Determine if it's an Android device */
    isAndroid: boolean;
    /** The name of the platform */
    isAndroidNativeWebScreenshot: boolean;
    /** If the instance is a mobile phone */
    isMobile: boolean;
    /** If the comparison needs to be done for a viewport screenshot or not */
    isViewPortScreenshot: boolean;
}

export type StatusAddressToolBarRectangles = Array<RectanglesOutput>;

export interface ElementRectangles {
    executor: Executor;
    base64Image: string;
    options: ElementRectanglesOptions;
    element: any;
}
