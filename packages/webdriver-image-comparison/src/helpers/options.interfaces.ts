import type { TabbableOptions } from '../commands/tabbable.interfaces'

export interface ClassOptions {
    /**
     * Class options
     */
    // The padding that needs to be added to the address bar on iOS and Android to do a proper cutout of the the viewport.
    addressBarShadowPadding?: number;
    // Automatically scroll to an element before taking a screenshot.
    autoElementScroll?: boolean;
    // Add iOS bezel corners and notch/dynamic island to the screenshot
    addIOSBezelCorners?: boolean;
    // If no baseline image is found during the comparison the image is automatically copied to the baseline folder when this is set to `true`
    autoSaveBaseline?: boolean;
    // The directory that will hold all the baseline images that are used to during the comparison
    baselineFolder?: any;
    // Delete runtime folder (actual & diff) on initialization
    clearRuntimeFolder?: boolean;
    // The naming of the saved images can be customized by passing the parameter `formatImageName` with a format string
    formatImageName?: string;
    // Is it an hybrid app or not
    isHybridApp?: boolean;
    // Level to show logs
    logLevel?: LogLevel;
    // Save the images per instance in a separate folder.
    savePerInstance?: boolean;
    // The directory that will hold all the actual / difference screenshots
    screenshotPath?: any;
    // The padding that needs to be added to the toolbar bar on iOS and Android to do a proper cutout of the the viewport.
    toolBarShadowPadding?: number;

    /**
     * Class and method options
     */
    // En/Disable all css animations and the input caret in the application.
    disableCSSAnimation?: boolean;
    // The timeout in milliseconds to wait after a scroll. This might help identifying pages with lazy loading.
    fullPageScrollTimeout?: number;
    // Hide scrollbars
    hideScrollBars?: boolean;

    /**
     * Compare options
     */
    // Automatically block out the side bar for iPads in landscape mode during comparisons. This prevents failures on the tab/private/bookmark native component.
    blockOutSideBar?: boolean;
    // Automatically block out the status and address bar during comparisons. This prevents failures on time, wifi or battery status.
    // This is mobile only.
    blockOutStatusBar?: boolean;
    // Automatically block out the tool bar. This is mobile only.
    blockOutToolBar?: boolean;
    // Compare images and discard alpha.
    ignoreAlpha?: boolean;
    // Compare images and discard anti aliasing.
    ignoreAntialiasing?: boolean;
    // Even though the images are in colour, the comparison wil compare 2 black/white images
    ignoreColors?: boolean;
    // Compare images and compare with `red = 16, green = 16, blue = 16, alpha = 16, minBrightness=16, maxBrightness=240`
    ignoreLess?: boolean;
    // Compare images and compare with `red = 0, green = 0, blue = 0, alpha = 0, minBrightness=0, maxBrightness=255`
    ignoreNothing?: boolean;
    // If true the return percentage will be like `0.12345678`, default is `0.12`
    rawMisMatchPercentage?: boolean;
    // This will return all compare data, not only the mismatch percentage
    returnAllCompareData?: boolean;
    // Allowable value of misMatchPercentage that prevents saving image with differences
    saveAboveTolerance?: number;
    //Scale images to same size before comparison
    scaleImagesToSameSize?: boolean;

    /**
     * Tabbable options
     */
    tabbableOptions?: TabbableOptions;
}

export interface DefaultOptions {
    addressBarShadowPadding: number;
    autoElementScroll: boolean;
    addIOSBezelCorners: boolean;
    autoSaveBaseline: boolean;
    clearFolder: boolean;
    compareOptions: CompareOptions;
    disableCSSAnimation: boolean;
    formatImageName: string;
    fullPageScrollTimeout: number;
    hideScrollBars: boolean;
    isHybridApp: boolean;
    logLevel: LogLevel;
    savePerInstance: boolean;
    tabbableOptions: TabbableOptions;
    toolBarShadowPadding: number;
}

interface CompareOptions {
    blockOutSideBar: boolean;
    blockOutStatusBar: boolean;
    blockOutToolBar: boolean;
    ignoreAlpha: boolean;
    ignoreAntialiasing: boolean;
    ignoreColors: boolean;
    ignoreLess: boolean;
    ignoreNothing: boolean;
    rawMisMatchPercentage: boolean;
    returnAllCompareData: boolean;
    saveAboveTolerance: number;
    scaleImagesToSameSize: boolean;
}

export enum LogLevel {
    debug = 'debug',
    info = 'info',
    warn = 'warn',
    silent = 'silent',
}
