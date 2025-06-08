import type { ChainablePromiseElement } from 'webdriverio'
import type { Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'

export interface SaveElementOptions {
    wic: DefaultOptions;
    method: SaveElementMethodOptions;
}

export interface SaveElementMethodOptions extends Partial<Folders> {
    /**
     * The padding that needs to be added to the address bar on iOS and Android
     * @default 6
     */
    addressBarShadowPadding?: number;
    /**
     * Disable the blinking cursor
     * @default false
     */
    disableBlinkingCursor?: boolean;
    /**
     * Disable all css animations
     * @default false
     */
    disableCSSAnimation?: boolean;
    /**
     * Make all text on a page transparent to only focus on the layout
     * @default false
     */
    enableLayoutTesting?: boolean;
    /**
     * By default the screenshots are taken with the BiDi protocol if Bidi is available.
     * If you want to use the legacy method, set this to true.
     * @default false
     */
    enableLegacyScreenshotMethod?: boolean;
    /**
     * Hide all scrollbars
     * @default true
     */
    hideScrollBars?: boolean;
    /**
     * The resizeDimensions
     * @default { top: 0, left: 0, width: 0, height: 0 }
     */
    resizeDimensions?: ResizeDimensions;
    /**
     * The padding that needs to be added to the tool bar on iOS and Android
     * @default 6
     */
    toolBarShadowPadding?: number;
    /**
     * Elements that need to be hidden (visibility: hidden) before saving a screenshot
     * @default []
     */
    hideElements?: HTMLElement[];
    /**
     * Elements that need to be removed (display: none) before saving a screenshot
     * @default []
     */
    removeElements?: HTMLElement[];
    /**
     * Wait for the fonts to be loaded
     * @default true
     */
    waitForFontsLoaded?: boolean;
}

export interface CheckElementMethodOptions extends SaveElementMethodOptions, CheckMethodOptions { }

export interface CheckElementOptions {
    wic: DefaultOptions;
    method: CheckElementMethodOptions;
}

export type WicElement = WebdriverIO.Element | ChainablePromiseElement
