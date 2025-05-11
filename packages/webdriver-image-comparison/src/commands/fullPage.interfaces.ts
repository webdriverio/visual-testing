import type { Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'

export interface SaveFullPageOptions {
    wic: DefaultOptions;
    method: SaveFullPageMethodOptions;
}

export interface SaveFullPageMethodOptions extends Partial<Folders> {
    /**
     * The padding that needs to be added to the address bar on iOS and Android
     * @default 6
     */
    addressBarShadowPadding?: number;
    /**
     * Create fullpage screenshots with the "legacy" protocol which used scrolling and stitching
     * @default false
     */
    userBasedFullPageScreenshot?: boolean;
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
     * The amount of milliseconds to wait for a new scroll. This will be used for the legacy
     * fullpage screenshot method.
     * @default 1500
     */
    fullPageScrollTimeout?: number;
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
     * Elements that need to be hidden after the first scroll for a fullpage scroll
     * @default []
     */
    hideAfterFirstScroll?: HTMLElement[];
    /**
     * Wait for the fonts to be loaded
     * @default true
     */
    waitForFontsLoaded?: boolean;
}

export interface CheckFullPageMethodOptions extends SaveFullPageMethodOptions, CheckMethodOptions { }

export interface CheckFullPageOptions {
    wic: DefaultOptions;
    method: CheckFullPageMethodOptions;
}
