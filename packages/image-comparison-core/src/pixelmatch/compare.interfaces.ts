import type { BaseBoundingBox, BaseCoordinates } from '../base.interfaces.js'
import type { RawImage } from '../utils/imageUtils.js'

export interface CompareData {
    /** The mismatch percentage like 0.12345567 */
    rawMisMatchPercentage: number;
    /** The mismatch percentage like 0.12 */
    misMatchPercentage: number;
    /** Raw RGBA pixel data of the diff composited on the actual screenshot, with dimensions */
    getRawPixels: () => RawImage;
    /** Raw RGBA pixel data of the actual screenshot (image2) before any comparison transforms */
    getActualPixels: () => RawImage;
    /** Raw RGBA pixel data of the baseline (image1) before any comparison transforms */
    getBaselinePixels: () => RawImage;
    /** The diff image encoded as a PNG buffer */
    getBuffer: () => Promise<Buffer>;
    /** The bounds of the diff area */
    diffBounds: BaseBoundingBox;
    /** The analysis time in milliseconds */
    analysisTime: number;
    /** The diff pixels location(s) and color(s) */
    diffPixels: BaseCoordinates[];
}

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

type OutputSettings = {
    /** Box area to ignore during comparison */
    ignoredBoxes?: Box[] | undefined;
};

export type ComparisonIgnoreOption = 'nothing' | 'less' | 'antialiasing' | 'colors' | 'alpha';

export interface ComparisonOptions {
    /** Output settings for the comparison */
    output?: OutputSettings | undefined;
    /** Whether to scale images to the same size before comparison */
    scaleToSameSize?: boolean | undefined;
    /** What aspects to ignore during comparison */
    ignore?: ComparisonIgnoreOption | ComparisonIgnoreOption[] | undefined;
}
