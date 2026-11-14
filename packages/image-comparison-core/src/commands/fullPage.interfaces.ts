import type { BaseMobileWebScreenshotOptions, BaseWebScreenshotOptions, Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'
import type { ElementIgnore, WicElement } from './element.interfaces.js'

export interface SaveFullPageOptions {
    wic: DefaultOptions;
    method: SaveFullPageMethodOptions;
}

export interface SaveFullPageMethodOptions extends Partial<Folders>, BaseWebScreenshotOptions, BaseMobileWebScreenshotOptions {
    /**
     * Elements or regions to ignore when saving/comparing full-page (desktop and mobile web).
     * Same format as saveScreen / checkScreen (selectors or { x, y, width, height } in document CSS pixels).
     */
    ignore?: (ElementIgnore | ElementIgnore[])[];
    /**
     * The amount of milliseconds to wait for a new scroll. This will be used for the legacy
     * fullpage screenshot method.
     * @default 1500
     */
    fullPageScrollTimeout?: number;
    /**
     * Elements that need to be hidden after the first scroll for a fullpage scroll
     * @default []
     */
    hideAfterFirstScroll?: HTMLElement[];
    /**
     * The resizeDimensions
     * @default { top: 0, left: 0, width: 0, height: 0 }
     */
    resizeDimensions?: ResizeDimensions;
    /**
     * Create fullpage screenshots with the "legacy" protocol which used scrolling and stitching
     * @default false
     */
    userBasedFullPageScreenshot?: boolean;
    /**
     * The element that scrolls, for a page where a container scrolls and not the page itself (for example an app
     * with a fixed header). The image is then the viewport with this container expanded: the part above the
     * container, the full content of the container, and the part below it. The screenshot scrolls and stitches,
     * also in a WebDriver BiDi session.
     * @default undefined
     */
    scrollContainer?: WicElement;
}

export interface CheckFullPageMethodOptions extends SaveFullPageMethodOptions, CheckMethodOptions { }

export interface CheckFullPageOptions {
    wic: DefaultOptions;
    method: CheckFullPageMethodOptions;
}
