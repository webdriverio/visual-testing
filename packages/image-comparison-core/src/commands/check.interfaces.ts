import type { InternalSaveMethodOptions } from './save.interfaces.js'
import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'
import type { CheckElementOptions, ElementIgnore, WicElement } from './element.interfaces.js'
import type { CheckFullPageOptions } from './fullPage.interfaces.js'
import type { CheckScreenOptions } from './screen.interfaces.js'
import type { CheckTabbableOptions } from './tabbable.interfaces.js'
import type { BaseImageCompareOptions, BaseMobileBlockOutOptions } from '../base.interfaces.js'
import type { TestContext } from '../methods/compareReport.interfaces.js'

export interface CheckMethodOptions extends BaseImageCompareOptions, BaseMobileBlockOutOptions {
    /**
     * Block out array with x, y, width and height values
     */
    blockOut?: RectanglesOutput[];
    /**
     * Ignore elements and or areas
     */
    ignore?: ElementIgnore[];
}

export interface InternalCheckMethodOptions extends InternalSaveMethodOptions {
    testContext: TestContext;
}

export interface InternalCheckScreenMethodOptions extends InternalCheckMethodOptions {
    checkScreenOptions: CheckScreenOptions;
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
