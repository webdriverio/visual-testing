export interface CompareData {
    /** The mismatch percentage like 0.12345567 */
    rawMisMatchPercentage: number;
    /** The mismatch percentage like 0.12 */
    misMatchPercentage: number;
    /** The image buffer */
    getBuffer: () => Buffer;
    /** The bounds of the diff area */
    diffBounds: {
        /** Top boundary of the diff area */
        top: number;
        /** Left boundary of the diff area */
        left: number;
        /** Bottom boundary of the diff area */
        bottom: number;
        /** Right boundary of the diff area */
        right: number;
    };
    /** The analysis time in milliseconds */
    analysisTime: number;
    /** The diff pixels location(s) and color(s) */
    diffPixels: {
            /** X coordinate of the diff pixel */
            x: number;
            /** Y coordinate of the diff pixel */
            y: number;
        }[];

}

/**
 * Src: @types/resemblejs
 */
type OutputSettings = {
    /** Color to use for highlighting errors */
    errorColor?:
        | {
            /** Red color component (0-255) */
            red: number;
            /** Green color component (0-255) */
            green: number;
            /** Blue color component (0-255) */
            blue: number;
        }
        | undefined;
    /** Type of error highlighting to use */
    errorType?: OutputErrorType | undefined;
    /** Custom error pixel processing function */
    errorPixel?: ((px: number[], offset: number, d1: Color, d2: Color) => void) | undefined;
    /** Transparency level for the output image */
    transparency?: number | undefined;
    /** Threshold for large image processing */
    largeImageThreshold?: number | undefined;
    /** Whether to use cross-origin for image loading */
    useCrossOrigin?: boolean | undefined;
    /** Bounding box to focus comparison on */
    boundingBox?: Box | undefined;
    /** Box area to ignore during comparison */
    ignoredBox?: Box | undefined;
    /** Multiple bounding boxes to focus comparison on */
    boundingBoxes?: Box[] | undefined;
    /** Multiple box areas to ignore during comparison */
    ignoredBoxes?: Box[] | undefined;
    /** Color to ignore during comparison */
    ignoreAreasColoredWith?: Color | undefined;
};

type Box = {
    /** Left boundary of the box */
    left: number;
    /** Top boundary of the box */
    top: number;
    /** Right boundary of the box */
    right: number;
    /** Bottom boundary of the box */
    bottom: number;
};

type Color = {
    /** Red color component (0-255) */
    r: number;
    /** Green color component (0-255) */
    g: number;
    /** Blue color component (0-255) */
    b: number;
    /** Alpha transparency component (0-255) */
    a: number;
};

type Tolerance = {
    /** Tolerance for red color component */
    red?: number;
    /** Tolerance for green color component */
    green?: number;
    /** Tolerance for blue color component */
    blue?: number;
    /** Tolerance for alpha transparency component */
    alpha?: number;
    /** Minimum brightness tolerance */
    minBrightness?: number;
    /** Maximum brightness tolerance */
    maxBrightness?: number;
};

type OutputErrorType = 'flat' | 'movement' | 'flatDifferenceIntensity' | 'movementDifferenceIntensity' | 'diffOnly';

export type ComparisonIgnoreOption = 'nothing' | 'less' | 'antialiasing' | 'colors' | 'alpha';
export interface ComparisonOptions {
    /** Output settings for the comparison */
    output?: OutputSettings | undefined;
    /** Threshold to return early if mismatch exceeds this value */
    returnEarlyThreshold?: number | undefined;
    /** Whether to scale images to the same size before comparison */
    scaleToSameSize?: boolean | undefined;
    /** What aspects to ignore during comparison */
    ignore?: ComparisonIgnoreOption | ComparisonIgnoreOption[] | undefined;
    /** Tolerance settings for color differences */
    tolerance?: Tolerance | undefined;
}
export interface ComparisonResult {
    /**
     * Error information if error encountered
     *
     * Note: If error encountered, other properties will be undefined
     */
    error?: unknown | undefined;

    /**
     * Time consumed by the comparison (in milliseconds)
     */
    analysisTime: number;

    /**
     * Do the two images have the same dimensions?
     */
    isSameDimensions: boolean;

    /**
     * The difference in width and height between the dimensions of the two compared images
     */
    dimensionDifference: {
        width: number;
        height: number;
    };

    /**
     * The percentage of pixels which do not match between the images
     */
    rawMisMatchPercentage: number;

    /**
     * Same as `rawMisMatchPercentage` but fixed to 2-digit after the decimal point
     */
    misMatchPercentage: number;

    diffBounds: Box;

    /**
     * Get a data URL for the comparison image
     */
    getImageDataUrl(): string;

    /**
     * Get data buffer
     */
    getBuffer?: (includeOriginal: boolean) => Buffer;
}
