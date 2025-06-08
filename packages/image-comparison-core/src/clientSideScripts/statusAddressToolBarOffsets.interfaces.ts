import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'

export interface StatusAddressToolBarOffsets {
    leftSidePadding: RectanglesOutput;
    rightSidePadding: RectanglesOutput;
    safeArea: number;
    screenHeight: number;
    screenWidth: number;
    statusAddressBar: RectanglesOutput;
    toolBar: RectanglesOutput;
}
