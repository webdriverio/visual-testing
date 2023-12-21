import type { Executor } from './methods.interface'

export interface RectanglesOptions {
    // The device pixel ration of the screen / device
    devicePixelRatio: number;
    // If this is an Android native screenshot
    isAndroidNativeWebScreenshot: boolean;
    // The inner height of a screen
    innerHeight: number;
    // If this is an iOS device
    isIos: boolean;
}

export interface ElementRectanglesOptions extends RectanglesOptions {
    // If this is an Android device
    isAndroid: boolean;
    // If it's landscape
    isLandscape: boolean;
}

export interface ScreenRectanglesOptions extends RectanglesOptions {
    // The inner height
    innerWidth: number;
    // If this is an Android ChromeDriver screenshot
    isAndroidChromeDriverScreenshot: boolean;
    // If it's landscape
    isLandscape: boolean;
}

export interface RectanglesOutput {
    height: number;
    width: number;
    x: number;
    y: number;
}

export interface StatusAddressToolBarRectanglesOptions {
    // If the side bar needs to be blocked out
    blockOutSideBar: boolean;
    // If the status and address bar needs to be blocked out
    blockOutStatusBar: boolean;
    // If the tool bar needs to be blocked out
    blockOutToolBar: boolean;
    // The name of the platform
    isAndroidNativeWebScreenshot: boolean;
    // Is it an hybrid app or not
    isHybridApp: boolean;
    // If it's in landscape mode
    isLandscape: boolean;
    // If the instance is a mobile phone
    isMobile: boolean;
    // If the comparison needs to be done for a viewport screenshot or not
    isViewPortScreenshot: boolean;
    // The name of the platform
    platformName: string;
}

export type StatusAddressToolBarRectangles = Array<RectanglesOutput>;

export interface ElementRectangles {
    executor: Executor;
    base64Image: string;
    options: ElementRectanglesOptions;
    element: any;
}
