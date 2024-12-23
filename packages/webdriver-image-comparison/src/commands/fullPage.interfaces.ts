import type { Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { ResizeDimensions } from '../methods/images.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'

export interface SaveFullPageOptions {
    wic: DefaultOptions;
    method: SaveFullPageMethodOptions;
}

export interface SaveFullPageMethodOptions extends Partial<Folders> {
    // The padding that needs to be added to the address bar on iOS and Android
    addressBarShadowPadding?: number;
    // Disable the blinking cursor
    disableBlinkingCursor?: boolean;
    // Disable all css animations
    disableCSSAnimation?: boolean;
    // Make all text on a page transparent to only focus on the layout
    enableLayoutTesting?: boolean;
    // Hide all scrollbars
    hideScrollBars?: boolean;
    // The amount of milliseconds to wait for a new scroll
    fullPageScrollTimeout?: number;
    // The resizeDimensions
    resizeDimensions?: ResizeDimensions;
    // The padding that needs to be added to the tool bar on iOS and Android
    toolBarShadowPadding?: number;
    // Elements that need to be hidden (visibility: hidden) before saving a screenshot
    hideElements?: HTMLElement[];
    // Elements that need to be removed (display: none) before saving a screenshot
    removeElements?: HTMLElement[];
    // Elements that need to be hidden after the first scroll for a fullpage scroll
    hideAfterFirstScroll?: HTMLElement[];
    // Wait for the fonts to be loaded
    waitForFontsLoaded?: boolean;
}

export interface CheckFullPageMethodOptions extends SaveFullPageMethodOptions, CheckMethodOptions { }

export interface CheckFullPageOptions {
    wic: DefaultOptions;
    method: CheckFullPageMethodOptions;
}
