export interface CompareData {
    // The mismatch percentage like 0.12345567
    rawMisMatchPercentage: number;
    // The mismatch percentage like 0.12
    misMatchPercentage: number;
    // The image
    getBuffer: () => Buffer;
    diffBounds: {
        top: number;
        left: number;
        bottom: number;
        right: number;
    };
    // The analysis time in milliseconds
    analysisTime: number;
    // The diff pixels location(s) and color(s)
    diffPixels:{
            x: number;
            y: number;
            originalColor: {r: number;g: number;b: number;a: number;}
            actualColor: {r: number;g: number;b: number;a: number;}
        }[];

}

/**
 * Src: @types/resemblejs
 */
interface OutputSettings {
    errorColor?:
        | {
            red: number;
            green: number;
            blue: number;
        }
        | undefined;
    errorType?: OutputErrorType | undefined;
    errorPixel?: ((px: number[], offset: number, d1: Color, d2: Color) => void) | undefined;
    transparency?: number | undefined;
    largeImageThreshold?: number | undefined;
    useCrossOrigin?: boolean | undefined;
    boundingBox?: Box | undefined;
    ignoredBox?: Box | undefined;
    boundingBoxes?: Box[] | undefined;
    ignoredBoxes?: Box[] | undefined;
    ignoreAreasColoredWith?: Color | undefined;
}
interface Box {
    left: number;
    top: number;
    right: number;
    bottom: number;
}
interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}
interface Tolerance {
    red?: number;
    green?: number;
    blue?: number;
    alpha?: number;
    minBrightness?: number;
    maxBrightness?: number;
}
type OutputErrorType = 'flat' | 'movement' | 'flatDifferenceIntensity' | 'movementDifferenceIntensity' | 'diffOnly';

export type ComparisonIgnoreOption = 'nothing' | 'less' | 'antialiasing' | 'colors' | 'alpha';
export interface ComparisonOptions {
    output?: OutputSettings | undefined;
    returnEarlyThreshold?: number | undefined;
    scaleToSameSize?: boolean | undefined;
    ignore?: ComparisonIgnoreOption | ComparisonIgnoreOption[] | undefined;
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
