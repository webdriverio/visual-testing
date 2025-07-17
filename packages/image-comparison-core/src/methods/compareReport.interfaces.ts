import type { CompareData } from 'src/resemble/compare.interfaces.js'
import type { WicImageCompareOptions } from './images.interfaces.js'
import type { BoundingBoxes, ReportFileSizes } from './rectangles.interfaces.js'
import type { FilePaths, FolderPaths } from 'src/base.interfaces.js'

export type TestContext = {
    /** The name of the command being executed */
    commandName: string
    /** The testing framework being used */
    framework: string
    /** The parent test suite or describe block */
    parent: string
    /** The tag associated with the test */
    tag: string
    /** The title of the test */
    title: string
    instanceData: {
        browser: {
            /** The name of the browser */
            name: string
            /** The version of the browser */
            version: string
        }
        /** The name of the device */
        deviceName: string
        platform: {
            /** The name of the platform */
            name: string
            /** The version of the platform */
            version: string
        }
        /** The application identifier */
        app: string
        /** Whether the device is mobile */
        isMobile: boolean
        /** Whether the device is Android */
        isAndroid: boolean
        /** Whether the device is iOS */
        isIOS: boolean
    }
}

export type BaseCreateCompareReportOptions = {
    /** Bounding boxes for diff and ignored areas */
    boundingBoxes: BoundingBoxes;
    /** Comparison data from the image comparison process */
    data: CompareData;
    /** Name of the file being compared */
    fileName: string;
    /** Test execution context and metadata */
    testContext: TestContext;
}

export type CreateCompareReportOptions = BaseCreateCompareReportOptions & {
    /** Folder paths for actual, baseline, and diff images */
    folders: FolderPaths;
    /** Size information for actual, baseline, and diff images */
    size: ReportFileSizes;
}

export type CreateJsonReportIfNeededOptions = BaseCreateCompareReportOptions & {
    /** Complete file paths for all comparison images */
    filePaths: FolderPaths & FilePaths;
    /** Device pixel ratio for the comparison */
    devicePixelRatio: number;
    /** Image comparison configuration options */
    imageCompareOptions: WicImageCompareOptions;
    /** Whether to store diff images */
    storeDiffs: boolean;
}

export type ResultReport = {
    /** Test description or suite name */
    description: string;
    /** Test title or name */
    test: string;
    /** Test tag identifier */
    tag: string;
    /** Test instance information (browser, device, platform) */
    instanceData: {
        /** Application identifier */
        app?: string;
        /** Browser name and version */
        browser?: { name: string; version: string };
        /** Device name */
        deviceName?: string;
        /** Platform name and version */
        platform: { name: string; version: string };
    };
    /** Command that was executed */
    commandName: string;
    /** Testing framework being used */
    framework: string;
    /** Bounding boxes for diff and ignored areas */
    boundingBoxes: BoundingBoxes;
    /** File data including paths and sizes */
    fileData: FilePaths & {
        /** Name of the file */
        fileName: string;
        /** Size information for images */
        size: ReportFileSizes;
    };
    /** Mismatch percentage as formatted string */
    misMatchPercentage: string;
    /** Raw mismatch percentage as number */
    rawMisMatchPercentage: number;
}
