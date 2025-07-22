import type { RectanglesOutput } from './rectangles.interfaces.js'
import type { BaseCoordinates, BaseDeviceInfo, BaseDimensions, BaseImageCompareOptions, BaseMobileBlockOutOptions, Folders } from '../base.interfaces.js'
import type { TestContext } from './compareReport.interfaces.js'
import type { DeviceRectangles } from './rectangles.interfaces.js'
import type { WicElement } from 'src/index.js'

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

export interface WicImageCompareOptions extends BaseImageCompareOptions, BaseMobileBlockOutOptions {
    /** Create a json file with the diff data, this can be used to create a custom report. */
    createJsonReportFiles: boolean;
    /** The proximity of the diff pixels to determine if a diff pixel is part of a group,
     * the higher the number the more pixels will be grouped, the lower the number the less pixels will be grouped due to accuracy.
     * Default is 5 pixels */
    diffPixelBoundingBoxProximity: number;
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

export interface MethodImageCompareCompareOptions extends BaseImageCompareOptions {
    /** Block out array with x, y, width and height values */
    blockOut?: RectanglesOutput[];
    /** Default false. If true, return percentage will be like 0.12345678, default is 0.12 */
    rawMisMatchPercentage?: boolean;

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

export interface Pixel extends BaseCoordinates {}

export interface CroppedBase64Image extends Partial<BaseDeviceInfo>{
    /** Whether to add iOS bezel corners */
    addIOSBezelCorners: boolean;
    /** The base64 image */
    base64Image: string;
    /** Whether this is a webdriver element screenshot */
    isWebDriverElementScreenshot?: boolean;
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

export interface CropAndConvertToDataURL extends BaseDimensions {
    /** Whether to add iOS bezel corners */
    addIOSBezelCorners: boolean,
    /** The base64 image */
    base64Image: string,
    /** The name of the device */
    deviceName: string,
    /** The device pixel ratio */
    devicePixelRatio: number,
    /** Whether this is an iOS device */
    isIOS: boolean,
    /** Whether the image is in landscape mode */
    isLandscape: boolean,
    /** The source x coordinate */
    sourceX: number,
    /** The source y coordinate */
    sourceY: number,
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

export interface HandleIOSBezelCorners extends BaseDimensions {
    /** Whether to add iOS bezel corners */
    addIOSBezelCorners: boolean,
    /** The name of the device */
    deviceName: string,
    /** The device pixel ratio */
    devicePixelRatio: number,
    /** The image */
    image: any, // There is no type for Jimp image
    /** Whether the image is in landscape mode */
    isLandscape: boolean,
}

export interface MakeFullPageBase64ImageOptions {
    /** The device pixel ratio */
    devicePixelRatio: number;
    /** Whether the image is in landscape mode */
    isLandscape: boolean;
}

export interface TakeResizedBase64ScreenshotOptions {
    /** The browser instance */
    browserInstance: WebdriverIO.Browser;
    /** The element to take the screenshot of */
    element: WicElement;
    /** The device pixel ratio */
    devicePixelRatio: number;
    /** Whether the image is in landscape mode */
    isIOS: boolean;
    /** The resize dimensions */
    resizeDimensions: ResizeDimensions;
}

export interface TakeBase64ElementScreenshotOptions extends TakeResizedBase64ScreenshotOptions {}
