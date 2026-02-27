import type { ChainablePromiseElement } from 'webdriverio'
import type { BaseMobileWebScreenshotOptions, BaseWebScreenshotOptions, Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'
import type { RectanglesOutput } from '../methods/rectangles.interfaces.js'

export interface SaveElementOptions {
    wic: DefaultOptions;
    method: SaveElementMethodOptions;
}

export interface SaveElementMethodOptions extends Partial<Folders>, BaseWebScreenshotOptions, BaseMobileWebScreenshotOptions {
    /**
     * Padding in device pixels added to each side of element ignore regions (makes each region 2× this value wider and higher).
     * Helps avoid 1px boundary differences on high-DPR / BiDi. Set to 0 to disable.
     * @default 1
     */
    ignoreRegionPadding?: number;

    /**
     * Resize the screenshot to the given dimensions
     * @default undefined
     */
    resizeDimensions?: ResizeDimensions;
}

export interface CheckElementMethodOptions extends SaveElementMethodOptions, CheckMethodOptions { }

export interface CheckElementOptions {
    wic: DefaultOptions;
    method: CheckElementMethodOptions;
}

/** The Wic element */
export type WicElement = WebdriverIO.Element | ChainablePromiseElement

export type ElementIgnore = RectanglesOutput | WicElement
