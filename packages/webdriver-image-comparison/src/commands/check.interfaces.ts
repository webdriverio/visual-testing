import type { ChainablePromiseElement } from 'webdriverio'
import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'

export interface CheckMethodOptions {
    // Block out array with x, y, width and height values
    blockOut?: RectanglesOutput[];
    // Block out the side bar on iOS iPads in landscape mode
    blockOutSideBar?: boolean;
    // Block out the status bar yes or no
    blockOutStatusBar?: boolean;
    // Block out the tool bar yes or no
    blockOutToolBar?: boolean;
    // Ignore elements and or areas
    ignore?: (RectanglesOutput | WebdriverIO.Element | ChainablePromiseElement)[];
    // Compare images and discard alpha
    ignoreAlpha?: boolean;
    // Compare images an discard anti aliasing
    ignoreAntialiasing?: boolean;
    // Even though the images are in color, the comparison wil compare 2 black/white images
    ignoreColors?: boolean;
    // Compare images and compare with red = 16, green = 16, blue = 16, alpha = 16, minBrightness=16, maxBrightness=240
    ignoreLess?: boolean;
    // Compare images and compare with red = 0, green = 0, blue = 0, alpha = 0, minBrightness=0, maxBrightness=255
    ignoreNothing?: boolean;
    // Default false. If true, return percentage will be like 0.12345678, default is 0.12
    rawMisMatchPercentage?: boolean;
    // Return all the compare data object
    returnAllCompareData?: boolean;
    // Allowable value of misMatchPercentage that prevents saving image with
    saveAboveTolerance?: number;
    //Scale images to same size before comparison
    scaleImagesToSameSize?: boolean;
}
