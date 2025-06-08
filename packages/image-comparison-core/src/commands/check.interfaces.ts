import type { ChainablePromiseElement } from 'webdriverio'
import type { InternalSaveMethodOptions } from './save.interfaces.js'
import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'
import type { CheckElementOptions, WicElement } from './element.interfaces.js'
import type { CheckFullPageOptions } from './fullPage.interfaces.js'
import type { CheckScreenOptions } from './screen.interfaces.js'
import type { CheckTabbableOptions } from './tabbable.interfaces.js'

export interface CheckMethodOptions {
    /**
     * Block out array with x, y, width and height values
     */
    blockOut?: RectanglesOutput[];
    /**
     * Block out the side bar on iOS iPads in landscape mode
     * @default false
     */
    blockOutSideBar?: boolean;
    /**
     * Block out the status bar yes or no
     * @default false
     */
    blockOutStatusBar?: boolean;
    /**
     * Block out the tool bar yes or no
     * @default false
     */
    blockOutToolBar?: boolean;
    /**
     * Ignore elements and or areas
     */
    ignore?: (RectanglesOutput | WebdriverIO.Element | ChainablePromiseElement)[];
    /**
     * Compare images and discard alpha
     * @default false
     */
    ignoreAlpha?: boolean;
    /**
     * Compare images an discard anti aliasing
     * @default false
     */
    ignoreAntialiasing?: boolean;
    /**
     * Even though the images are in color, the comparison wil compare 2 black/white images
     * @default false
     */
    ignoreColors?: boolean;
    /**
     * Compare images and compare with red = 16, green = 16, blue = 16, alpha = 16, minBrightness=16, maxBrightness=240
     * @default false
     */
    ignoreLess?: boolean;
    /**
     * Compare images and compare with red = 0, green = 0, blue = 0, alpha = 0, minBrightness=0, maxBrightness=255
     * @default false
     */
    ignoreNothing?: boolean;
    /**
     * Default false. If true, return percentage will be like 0.12345678, default is 0.12
     * @default false
     */
    rawMisMatchPercentage?: boolean;
    /**
     * Return all the compare data object
     * @default false
     */
    returnAllCompareData?: boolean;
    /**
     * Allowable value of misMatchPercentage that prevents saving image with differences
     * @default 0
     */
    saveAboveTolerance?: number;
    /**
     * Scale images to same size before comparison
     * @default false
     */
    scaleImagesToSameSize?: boolean;
}

export type TestContext = {
    commandName: string;
    framework: string;
    parent: string;
    tag: string;
    title: string;
    instanceData: {
        browser: {
            name: string;
            version: string;
        },
        deviceName: string;
        platform: {
            name: string;
            version: string;
        },
        app: string;
        isMobile: boolean;
        isAndroid: boolean;
        isIOS: boolean;
    }
}

export interface InternalCheckMethodOptions extends InternalSaveMethodOptions {
    testContext: TestContext;
}

export interface InternalCheckElementMethodOptions extends InternalCheckMethodOptions {
    element: WicElement | HTMLElement;
    checkElementOptions: CheckElementOptions;
}

export interface InternalCheckFullPageMethodOptions extends InternalCheckMethodOptions {
    checkFullPageOptions: CheckFullPageOptions,
}

export interface InternalCheckTabbablePageMethodOptions extends InternalCheckMethodOptions {
    checkTabbableOptions: CheckTabbableOptions,
}

export interface InternalCheckScreenMethodOptions extends InternalCheckMethodOptions {
    checkScreenOptions: CheckScreenOptions;
}
