import type { RectanglesOutput } from '../methods/rectangles.interfaces'

export interface StatusAddressToolBarOffsets {
    safeArea: number;
    screenHeight: number;
    screenWidth: number;
    sideBar: RectanglesOutput;
    statusAddressBar: RectanglesOutput;
    toolBar: RectanglesOutput;
}
