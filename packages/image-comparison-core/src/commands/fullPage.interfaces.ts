import type { BaseMobileWebScreenshotOptions, BaseWebScreenshotOptions, Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'

export interface SaveFullPageOptions {
    wic: DefaultOptions;
    method: SaveFullPageMethodOptions;
}

export interface SaveFullPageMethodOptions extends Partial<Folders>, BaseWebScreenshotOptions, BaseMobileWebScreenshotOptions {
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
}

export interface CheckFullPageMethodOptions extends SaveFullPageMethodOptions, CheckMethodOptions { }

export interface CheckFullPageOptions {
    wic: DefaultOptions;
    method: CheckFullPageMethodOptions;
}
