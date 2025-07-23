export interface ScreenshotOutput {
    // The device pixel ratio of the instance
    devicePixelRatio: number;
    // The filename
    fileName: string;
    // Is Landscape
    isLandscape: boolean;
    // The path where the file can be found
    path: string;
}

export interface AfterScreenshotOptions {
    // The actual folder where the images need to be saved
    actualFolder: string;
    // The image
    base64Image: string;
    // Disable the blinking cursor
    disableBlinkingCursor?: boolean;
    // Disable all css animations
    disableCSSAnimation?: boolean;
    // Make all text on a page transparent to only focus on the layout
    enableLayoutTesting?: boolean;
    // If scrollbars need to be hidden
    hideScrollBars?: boolean;
    // The file path options
    filePath: ScreenshotFilePathOptions;
    // The file name options object
    fileName: ScreenshotFileNameOptions;
    // Elements that need to be hidden (visibility: hidden) before saving a screenshot
    hideElements?: (HTMLElement | HTMLElement[])[];
    // If it's in landscape mode
    isLandscape: boolean;
    // isNativeContext
    isNativeContext: boolean;
    // The platform name of the instance
    platformName: string;
    // Elements that need to be removed (display: none) before saving a screenshot
    removeElements?: (HTMLElement | HTMLElement[])[];
}

export interface ScreenshotFilePathOptions {
    // The name of the browser
    browserName: string;
    // The name of the device
    deviceName: string;
    // Is the instance a mobile
    isMobile: boolean;
    // If the folder needs to have the instance name in it
    savePerInstance: boolean;
}

export interface ScreenshotFileNameOptions {
    // The browser name
    browserName: string;
    // The browser version
    browserVersion: string;
    // The device name
    deviceName: string;
    // The device pixel ratio
    devicePixelRatio: number;
    // The string that needs to be formated
    formatImageName: string;
    // Is this a mobile
    isMobile: boolean;
    // Is the test executed in a browser
    isTestInBrowser: boolean;
    // The log name of the instance
    logName: string;
    // The the name of the instance
    name: string;
    // The outer height of the screen
    outerHeight?: number;
    // The outer width of the screen
    outerWidth?: number;
    // The platform name
    platformName: string;
    // The platform version
    platformVersion: string;
    // The height of the screen
    screenHeight: number;
    // The width of the screen
    screenWidth: number;
    // The tag of the image
    tag: string;
}
