import type { PixelmatchCompareOptions } from './pixelmatch/compare.interfaces.js'

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
     * Padding in device pixels added to each side of ignore regions (makes each region 2× this value wider and higher).
     * Helps avoid 1px boundary differences on high-DPR / BiDi. Set to 0 to disable.
     * Applies to screen, element, and full-page web methods.
     * @default 1
     */
    ignoreRegionPadding?: number;
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
     * Ignore alpha-channel differences during comparison.
     * Preprocessing sets all alpha values to opaque before pixelmatch runs.
     * Preset: strict threshold (~16/255), AA not forgiven.
     * @default false
     */
    ignoreAlpha?: boolean;
    /**
     * Forgive anti-aliased pixels during comparison (pixelmatch `includeAA: false`).
     * Preset: relaxed threshold (~32/255), AA forgiven.
     * When combined with other ignore flags, last-wins order applies
     * (`alpha` → `antialiasing` → `colors` → `less` → `nothing`).
     * @default true
     */
    ignoreAntialiasing?: boolean;
    /**
     * Compare brightness only, ignoring hue differences.
     * Preprocessing converts both images to grayscale using resemble luma (`0.3/0.59/0.11`).
     * Preset: strict threshold (~16/255), AA not forgiven.
     * @default false
     */
    ignoreColors?: boolean;
    /**
     * Use a relaxed RGB tolerance (~16/255 per channel in YIQ space).
     * Preset: strict threshold, AA not forgiven (does not inherit default AA forgiveness).
     * @default false
     */
    ignoreLess?: boolean;
    /**
     * Use zero tolerance: any pixel difference counts as a mismatch.
     * Preset: threshold `0`, AA not forgiven.
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
    /**
     * Direct pixelmatch comparison settings.
     * Mutually exclusive with all `ignore*` options on the same object.
     */
    pixelmatch?: PixelmatchCompareOptions;
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
