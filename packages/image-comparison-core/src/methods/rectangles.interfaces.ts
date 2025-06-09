import type { CheckScreenMethodOptions } from '../commands/screen.interfaces.js'
import type { BaseDimensions, BaseRectangle } from '../base.interfaces.js'
import type { InstanceData } from './instanceData.interfaces.js'

export interface RectanglesOptions {
    /** The device pixel ratio of the screen / device */
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
    /** If the screen is emulated */
    isEmulated: boolean;
    /** The initial devicePixelRatio of the instance */
    initialDevicePixelRatio: number;
}

export interface ScreenRectanglesOptions extends RectanglesOptions {
    /** If the legacy screenshot method is enabled */
    enableLegacyScreenshotMethod: boolean;
    /** The inner width of the screen */
    innerWidth: number;
    /** If this is an Android ChromeDriver screenshot */
    isAndroidChromeDriverScreenshot: boolean;
    /** The initial devicePixelRatio of the instance */
    initialDevicePixelRatio: number;
    /** If the screen is emulated */
    isEmulated: boolean;
    /** If the screen is in landscape mode */
    isLandscape: boolean;
}

export interface RectanglesOutput extends BaseRectangle {}

export type DeviceRectangles = {
    /** The bottom bar rectangle */
    bottomBar: RectanglesOutput,
    /** The home bar rectangle */
    homeBar: RectanglesOutput,
    /** The left side padding rectangle */
    leftSidePadding: RectanglesOutput,
    /** The right side padding rectangle */
    rightSidePadding: RectanglesOutput,
    /** The screen size dimensions */
    screenSize: BaseDimensions,
    /** The status bar and address bar rectangle */
    statusBarAndAddressBar: RectanglesOutput,
    /** The status bar rectangle */
    statusBar: RectanglesOutput,
    /** The viewport rectangle */
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
    /** The browser instance */
    browserInstance: WebdriverIO.Browser;
    /** The base64 encoded image */
    base64Image: string;
    /** The options for element rectangles */
    options: ElementRectanglesOptions;
    /** The element to be compared */
    element: any;
}

export interface SplitIgnores {
    /** The elements to be ignored */
    elements: WebdriverIO.Element[];
    /** The regions to be ignored */
    regions: RectanglesOutput[];
}

export interface DetermineDeviceBlockOutsOptions {
    isAndroid: boolean,
    screenCompareOptions: CheckScreenMethodOptions,
    instanceData: InstanceData,
}