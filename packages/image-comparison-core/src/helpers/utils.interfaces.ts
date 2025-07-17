import type { BaseCoordinates, BaseDimensions, FilePaths, FolderPaths } from '../base.interfaces.js'
import type { DeviceRectangles } from '../methods/rectangles.interfaces.js'
import type { Folders } from '../base.interfaces.js'

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

export interface CommonCheckVariables {
    /** Folder paths */
    actualFolder: string;
    baselineFolder: string;
    diffFolder: string;

    /** Instance data properties */
    browserName: string;
    deviceName: string;
    deviceRectangles: any;
    isAndroid: boolean;
    isMobile: boolean;
    isAndroidNativeWebScreenshot: boolean;

    /** Optional instance data (not all methods need these) */
    platformName?: string;
    isIOS?: boolean;

    /** WIC options */
    autoSaveBaseline: boolean;
    savePerInstance: boolean;

    /** Optional WIC options (not all methods need these) */
    isHybridApp?: boolean;
}

export interface ExtractCommonCheckVariablesOptions {
    /** The folders object */
    folders: Folders;
    /** The instance data object */
    instanceData: any;
    /** The wic options object */
    wicOptions: any;
}

export interface FolderOptions {
    /** Whether to auto-save baseline images */
    autoSaveBaseline: boolean;
    /** The actual folder path */
    actualFolder: string;
    /** The baseline folder path */
    baselineFolder: string;
    /** The diff folder path */
    diffFolder: string;
    /** The browser name */
    browserName: string;
    /** The device name */
    deviceName: string;
    /** Whether this is a mobile device */
    isMobile: boolean;
    /** Whether to save per instance */
    savePerInstance: boolean;
}

export interface BuildFolderOptionsOptions {
    /** Common check variables that include all the needed folder options properties */
    commonCheckVariables: CommonCheckVariables;
}

export interface BaseExecuteCompareOptions {
    /** Compare options for both wic and method */
    compareOptions: {
        wic: any;
        method: any;
    };
    /** Device pixel ratio */
    devicePixelRatio: number;
    /** Device rectangles */
    deviceRectangles: any;
    /** File name */
    fileName: string;
    /** Folder options */
    folderOptions: FolderOptions;
    /** Whether this is Android */
    isAndroid: boolean;
    /** Whether this is Android native web screenshot */
    isAndroidNativeWebScreenshot: boolean;
    /** Optional: platform name */
    platformName?: string;
    /** Optional: whether this is iOS */
    isIOS?: boolean;
    /** Optional: whether this is hybrid app */
    isHybridApp?: boolean;
    /** Optional: ignore regions for special cases */
    ignoreRegions?: any[];
}

export interface BuildBaseExecuteCompareOptionsOptions {
    /** Common check variables that include device and folder info */
    commonCheckVariables: CommonCheckVariables;
    /** WIC compare options */
    wicCompareOptions: any;
    /** Method compare options */
    methodCompareOptions: any;
    /** Device pixel ratio from screenshot */
    devicePixelRatio: number;
    /** File name from screenshot */
    fileName: string;
    /** Whether to override wic options for element screenshots (sets blockOut* to false) */
    isElementScreenshot?: boolean;
    /** Additional properties to add to the options */
    additionalProperties?: Record<string, any>;
}

export interface PrepareComparisonFilePathsOptions extends Folders {
    /** The browser name */
    browserName: string;
    /** The device name */
    deviceName: string;
    /** Whether this is a mobile device */
    isMobile: boolean;
    /** Whether to save per instance */
    savePerInstance: boolean;
    /** The file name */
    fileName: string;
}

export interface ComparisonFilePaths extends FilePaths, FolderPaths {}
