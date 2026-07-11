import type { BaseBoundingBox, BaseCoordinates } from '../base.interfaces.js'
import type { RawImage } from '../utils/imageUtils.js'

export interface CompareData {
    /** The mismatch percentage like 0.12345567 */
    rawMisMatchPercentage: number;
    /** The mismatch percentage like 0.12 */
    misMatchPercentage: number;
    /** Raw RGBA pixel data of the diff composited on the actual screenshot, with dimensions */
    getRawPixels: () => RawImage;
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

/** User-facing pixelmatch options nested under `compareOptions.pixelmatch`. */
export interface PixelmatchCompareOptions {
    /** Sensitivity 0–1; lower = stricter. @default 0.1 */
    threshold?: number;
    /** `true` = strict (AA counts); `false` = forgive AA. @default false */
    includeAA?: boolean;
    /** `[R,G,B]` mismatch highlight colour. @default magenta */
    diffColor?: [number, number, number];
    /** `[R,G,B]` anti-aliasing highlight colour. @default magenta */
    aaColor?: [number, number, number];
    /** `[R,G,B]` added vs removed regions. @default magenta */
    diffColorAlt?: [number, number, number];
    /** Diff blend opacity, distinct from `ignoreAlpha`. @default 0.1 */
    alpha?: number;
    /** When true, use pixelmatch diff output directly instead of compositing on the screenshot. @default false */
    diffMask?: boolean;
    /** Semi-transparent pixel compositing. @default true */
    checkerboard?: boolean;
}

/** Fully resolved pixelmatch settings passed to the compare engine. */
export interface ResolvedPixelmatchOptions {
    threshold: number;
    includeAA: boolean;
    diffColor: [number, number, number];
    aaColor: [number, number, number];
    diffColorAlt: [number, number, number];
    alpha: number;
    diffMask: boolean;
    checkerboard: boolean;
}

export interface ComparisonOptions {
    /** Output settings for the comparison */
    output?: OutputSettings | undefined;
    /** Whether to scale images to the same size before comparison */
    scaleToSameSize?: boolean | undefined;
    /** What aspects to ignore during comparison (preset mode only) */
    ignore?: ComparisonIgnoreOption | ComparisonIgnoreOption[] | undefined;
    /** Direct pixelmatch settings (exclusive with `ignore` preset mode) */
    pixelmatch?: ResolvedPixelmatchOptions | undefined;
}
