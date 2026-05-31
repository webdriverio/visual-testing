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
     * Resize the screenshot to the given dimensions
     * @default undefined
     */
    resizeDimensions?: ResizeDimensions;
    /**
     * BiDi-only: which coordinate origin to use when capturing element screenshots via the BiDi protocol.
     * - `'document'` (default): renders the document layout, works for any element position but
     *   does NOT capture composited layers (scrollbars, fixed/sticky overlays, `will-change` elements).
     * - `'viewport'`: captures the composited frame as painted, which includes scrollbars and overlays,
     *   but requires the element to be fully visible in the viewport. Throws a descriptive error when the
     *   element is outside, partially outside, or larger than the viewport.
     * @default 'document'
     */
    biDiOrigin?: 'document' | 'viewport';
}

export interface CheckElementMethodOptions extends SaveElementMethodOptions, CheckMethodOptions { }

export interface CheckElementOptions {
    wic: DefaultOptions;
    method: CheckElementMethodOptions;
}

/** The Wic element */
export type WicElement = WebdriverIO.Element | ChainablePromiseElement

export type ElementIgnore = RectanglesOutput | WicElement
