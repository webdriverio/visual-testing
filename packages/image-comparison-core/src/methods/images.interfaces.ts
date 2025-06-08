import type { RectanglesOutput } from './rectangles.interfaces.js'
import type { Folders } from '../base.interfaces.js'
import type { TestContext } from 'src/commands/check.interfaces.js'
import type { DeviceRectangles } from './rectangles.interfaces.js'

export interface ResizeDimensions {
    /** The bottom margin */
    bottom?: number;
    /** The left margin */
    left?: number;
    /** The right margin */
    right?: number;
    /** The top margin */
    top?: number;
}

export interface ExecuteImageCompare {
    /** The options for image comparison */
    options: ImageCompareOptions;
    /** The test context */
    testContext: TestContext;
    /** Whether this is a viewport screenshot */
    isViewPortScreenshot: boolean;
    /** Whether this is a native context */
    isNativeContext: boolean;
}

export interface ImageCompareOptions {
    /** Optional ignore regions */
    ignoreRegions?: RectanglesOutput[];
    /** The device pixel ratio of the device */
    devicePixelRatio: number;
    /** The compare options */
    compareOptions: {
        wic: WicImageCompareOptions;
        method: ScreenMethodImageCompareCompareOptions;
    };
    /** The device rectangles */
    deviceRectangles: DeviceRectangles;
    /** The name of the file */
    fileName: string;
    /** The folders object */
    folderOptions: ImageCompareFolderOptions;
    /** Is this an Android device */
    isAndroid: boolean;
    /** If this is a native web screenshot */
    isAndroidNativeWebScreenshot: boolean;
}

export interface WicImageCompareOptions {
    /** Block out the side bar yes or no */
    blockOutSideBar: boolean;
    /** Block out the status bar yes or no */
    blockOutStatusBar: boolean;
    /** Block out the tool bar yes or no */
    blockOutToolBar: boolean;
    /** Create a json file with the diff data, this can be used to create a custom report. */
    createJsonReportFiles: boolean;
    /** The proximity of the diff pixels to determine if a diff pixel is part of a group,
     * the higher the number the more pixels will be grouped, the lower the number the less pixels will be grouped due to accuracy.
     * Default is 5 pixels */
    diffPixelBoundingBoxProximity: number;
    /** Compare images and discard alpha */
    ignoreAlpha: boolean;
    /** Compare images an discard anti aliasing */
    ignoreAntialiasing: boolean;
    /** Even though the images are in colour, the comparison wil compare 2 black/white images */
    ignoreColors: boolean;
    /** Compare images and compare with red = 16, green = 16, blue = 16,alpha = 16, minBrightness=16, maxBrightness=240 */
    ignoreLess: boolean;
    /** Compare images and compare with red = 0, green = 0, blue = 0, alpha = 0, minBrightness=0, maxBrightness=255 */
    ignoreNothing: boolean;
    /** Default false. If true, return percentage will be like 0.12345678, default is 0.12 */
    rawMisMatchPercentage: boolean;
    /** Return all the compare data object */
    returnAllCompareData: boolean;
    /** Allowable value of misMatchPercentage that prevents saving image with differences */
    saveAboveTolerance: number;
}

export interface DefaultImageCompareCompareOptions extends MethodImageCompareCompareOptions {
    /** Block out array with x, y, width and height values */
    blockOut?: RectanglesOutput[];
}

export interface ScreenMethodImageCompareCompareOptions
    extends DefaultImageCompareCompareOptions,
    MethodImageCompareCompareOptions {
    /** Block out the side bar yes or no */
    blockOutSideBar?: boolean;
    /** Block out the status bar yes or no */
    blockOutStatusBar?: boolean;
    /** Block out the tool bar yes or no */
    blockOutToolBar?: boolean;
}

export interface MethodImageCompareCompareOptions {
    /** Block out array with x, y, width and height values */
    blockOut?: RectanglesOutput[];
    /** Compare images and discard alpha */
    ignoreAlpha?: boolean;
    /** Compare images an discard anti aliasing */
    ignoreAntialiasing?: boolean;
    /** Even though the images are in colour, the comparison wil compare 2 black/white images */
    ignoreColors?: boolean;
    /** Compare images and compare with red = 16, green = 16, blue = 16,alpha = 16, minBrightness=16, maxBrightness=240 */
    ignoreLess?: boolean;
    /** Compare images and compare with red = 0, green = 0, blue = 0, alpha = 0, minBrightness=0, maxBrightness=255 */
    ignoreNothing?: boolean;
    /** Default false. If true, return percentage will be like 0.12345678, default is 0.12 */
    rawMisMatchPercentage?: boolean;
    /** Return all the compare data object */
    returnAllCompareData?: boolean;
    /** Allowable value of misMatchPercentage that prevents saving image with differences */
    saveAboveTolerance?: number;
    /** Scale images to same size before comparison */
    scaleImagesToSameSize?: boolean;
}

export interface ImageCompareFolderOptions extends Folders {
    /** Auto save image to baseline */
    autoSaveBaseline: boolean;
    /** The name of the browser */
    browserName: string;
    /** The name of the device */
    deviceName: string;
    /** Is the instance a mobile instance */
    isMobile: boolean;
    /** If the folder needs to have the instance name in it */
    savePerInstance: boolean;
}

export interface ImageCompareResult {
    /** The file name */
    fileName: string;
    folders: {
        /** The actual folder and file name */
        actual: string;
        /** The baseline folder and file name */
        baseline: string;
        /** This following folder is optional and only if there is a mismatch
         * The folder that holds the diffs and the file name */
        diff?: string;
    };
    /** The mismatch percentage */
    misMatchPercentage: number;
}

export interface BoundingBox {
    /** The bottom coordinate */
    bottom: number;
    /** The right coordinate */
    right: number;
    /** The left coordinate */
    left: number;
    /** The top coordinate */
    top: number;
}

export interface Pixel {
    /** The x coordinate */
    x: number;
    /** The y coordinate */
    y: number;
}

export interface IgnoreBoxes extends BoundingBox { }

export interface CroppedBase64Image {
    /** Whether to add iOS bezel corners */
    addIOSBezelCorners: boolean;
    /** The base64 image */
    base64Image: string;
    /** The name of the device */
    deviceName: string;
    /** The device pixel ratio */
    devicePixelRatio: number;
    /** Whether this is a webdriver element screenshot */
    isWebDriverElementScreenshot?: boolean;
    /** Whether this is an iOS device */
    isIOS: boolean;
    /** Whether the image is in landscape mode */
    isLandscape: boolean;
    /** The rectangles */
    rectangles: RectanglesOutput;
    /** The resize dimensions */
    resizeDimensions?: ResizeDimensions;
}

export interface RotateBase64ImageOptions {
    /** The base64 image */
    base64Image: string;
    /** The degrees to rotate */
    degrees: number;
}

export interface CropAndConvertToDataURL {
    /** Whether to add iOS bezel corners */
    addIOSBezelCorners: boolean,
    /** The base64 image */
    base64Image: string,
    /** The name of the device */
    deviceName: string,
    /** The device pixel ratio */
    devicePixelRatio: number,
    /** The height of the image */
    height: number,
    /** Whether this is an iOS device */
    isIOS: boolean,
    /** Whether the image is in landscape mode */
    isLandscape: boolean,
    /** The source x coordinate */
    sourceX: number,
    /** The source y coordinate */
    sourceY: number,
    /** The width of the image */
    width: number,
}

export interface AdjustedAxis {
    /** The length of the axis */
    length: number,
    /** The maximum dimension */
    maxDimension: number,
    /** The padding at the end */
    paddingEnd: number,
    /** The padding at the start */
    paddingStart: number,
    /** The start coordinate */
    start: number,
    /** The warning type */
    warningType: 'WIDTH' | 'HEIGHT',
}

export interface DimensionsWarning {
    /** The dimension */
    dimension: number,
    /** The maximum dimension */
    maxDimension: number,
    /** The position */
    position: number,
    /** The type of warning */
    type: string,
}

export interface CheckBaselineImageExists {
    /** The actual file path */
    actualFilePath: string,
    /** The baseline file path */
    baselineFilePath: string,
    /** Whether to auto save baseline */
    autoSaveBaseline?: boolean,
    /** Whether to update baseline */
    updateBaseline?: boolean,
}

export interface RotatedImage {
    /** Whether this is a webdriver element screenshot */
    isWebDriverElementScreenshot: boolean,
    /** Whether the image is in landscape mode */
    isLandscape: boolean,
    /** The base64 image */
    base64Image:string,
}

export interface HandleIOSBezelCorners {
    /** Whether to add iOS bezel corners */
    addIOSBezelCorners: boolean,
    /** The name of the device */
    deviceName: string,
    /** The device pixel ratio */
    devicePixelRatio: number,
    /** The height of the image */
    height: number,
    /** The image */
    image: any, // There is no type for Jimp image
    /** Whether the image is in landscape mode */
    isLandscape: boolean,
    /** The width of the image */
    width: number,
}

