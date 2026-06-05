import type { BaseImageCompareOptions, BaseMobileBlockOutOptions } from '../base.interfaces.js'
import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'

export interface CoreCompareOptions extends BaseImageCompareOptions {
    blockOut?: RectanglesOutput[];
}

export interface ScreenCompareOptions extends CoreCompareOptions, BaseMobileBlockOutOptions {
}

export interface WicCompareOptions extends BaseImageCompareOptions {
    /** Create a json file with the diff data, this can be used to create a custom report. */
    createJsonReportFiles: boolean;
    /** Mismatch percentage below which diff region analysis runs automatically (default 10).
     *  Analysis always runs when createJsonReportFiles is true. */
    diffAnalysisThreshold?: number;
    /** When true, treat the comparison as 0% mismatch if every diff region has
     *  isVisuallySignificant = false. The diff image is still saved for inspection. */
    ignoreVisuallyInsignificantDiffs?: boolean;
    /** The proximity of the diff pixels to determine if a diff pixel is part of a group,
     * the higher the number the more pixels will be grouped, the lower the number the less pixels will be grouped due to accuracy.
     * Default is 5 pixels */
    diffPixelBoundingBoxProximity: number;
}