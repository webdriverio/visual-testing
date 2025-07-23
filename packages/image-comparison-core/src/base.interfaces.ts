export interface Folders {
    /** The actual folder where the current screenshots need to be saved */
    actualFolder: string;
    /** The baseline folder where the baseline screenshots can be found */
    baselineFolder: string;
    /** The diff folder where the differences are saved */
    diffFolder: string;
}

export interface FolderPaths {
    /** The actual folder path where the current screenshots need to be saved */
    actualFolderPath: string;
    /** The baseline folder path where the baseline screenshots can be found */
    baselineFolderPath: string;
    /** The diff folder path where the differences are saved */
    diffFolderPath: string;
}

export interface FilePaths {
    /** The actual file path where the current screenshots need to be saved */
    actualFilePath: string;
    /** The baseline file path where the baseline screenshots can be found */
    baselineFilePath: string;
    /** The diff file path where the difference is saved */
    diffFilePath: string;
}

export interface BaseWebScreenshotOptions {
    /**
     * Disable the blinking cursor
     * @default false
     */
    disableBlinkingCursor?: boolean;
    /**
     * Disable all CSS animations
     * @default false
     */
    disableCSSAnimation?: boolean;
    /**
     * Make all text transparent to focus on layout
     * @default false
     */
    enableLayoutTesting?: boolean;
    /**
     * Use legacy screenshot method instead of BiDi protocol
     * @default false
     */
    enableLegacyScreenshotMethod?: boolean;
    /**
     * Hide all scrollbars
     * @default true
     */
    hideScrollBars?: boolean;
    /**
     * Elements to hide before taking screenshot
     * @default []
     */
    hideElements?: HTMLElement[];
    /**
     * Elements to remove before taking screenshot
     * @default []
     */
    removeElements?: HTMLElement[];
    /**
     * Wait for fonts to be loaded
     * @default true
     */
    waitForFontsLoaded?: boolean;
}

export interface BaseMobileWebScreenshotOptions {
    /**
     * Padding for the address bar shadow
     * @default 6
     */
    addressBarShadowPadding?: number;
    /**
     * Padding for the tool bar shadow
     * @default 6
     */
    toolBarShadowPadding?: number;
}

export interface BaseImageCompareOptions {
    /**
     * Compare images and discard alpha
     * @default false
     */
    ignoreAlpha?: boolean;
    /**
     * Compare images and discard anti aliasing
     * @default false
     */
    ignoreAntialiasing?: boolean;
    /**
     * Compare images in black and white mode
     * @default false
     */
    ignoreColors?: boolean;
    /**
     * Compare with reduced color sensitivity
     * @default false
     */
    ignoreLess?: boolean;
    /**
     * Compare with maximum sensitivity
     * @default false
     */
    ignoreNothing?: boolean;
    /**
     * Return raw mismatch percentage without rounding
     * @default false
     */
    rawMisMatchPercentage?: boolean;
    /**
     * Return all comparison data
     * @default false
     */
    returnAllCompareData?: boolean;
    /**
     * Save images only above this mismatch tolerance
     * @default 0
     */
    saveAboveTolerance?: number;
    /**
     * Scale images to same size before comparison
     * @default false
     */
    scaleImagesToSameSize?: boolean;
}

export interface BaseMobileBlockOutOptions {
    /**
     * Block out the side bar
     * @default false
     */
    blockOutSideBar?: boolean;
    /**
     * Block out the status bar
     * @default false
     */
    blockOutStatusBar?: boolean;
    /**
     * Block out the tool bar
     * @default false
     */
    blockOutToolBar?: boolean;
}

export interface BaseDeviceInfo {
    /**
     * The name of the browser
     * @default ''
     */
    browserName: string;
    /**
     * The name of the device
     * @default ''
     */
    deviceName: string;
    /**
     * The device pixel ratio
     * @default 1
     */
    devicePixelRatio: number;
    /**
     * Whether the device is Android
     * @default false
     */
    isAndroid: boolean;
    /**
     * Whether the device is iOS
     * @default false
     */
    isIOS: boolean;
    /**
     * Whether the device is mobile
     * @default false
     */
    isMobile: boolean;
}

export interface BaseCoordinates {
    /** The x-coordinate */
    x: number;
    /** The y-coordinate */
    y: number;
}

export interface BaseDimensions {
    /** The width */
    width: number;
    /** The height */
    height: number;
}

/** Base rectangle interface combining coordinates and dimensions */
export interface BaseRectangle extends BaseCoordinates, BaseDimensions {}

export interface BaseBoundingBox {
    /** The bottom coordinate */
    bottom: number;
    /** The right coordinate */
    right: number;
    /** The left coordinate */
    left: number;
    /** The top coordinate */
    top: number;
}
