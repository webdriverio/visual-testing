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
    // The padding that needs to be added to the address bar on iOS and Android
    addressBarShadowPadding?: number;
    // Disable all css animations
    disableCSSAnimation?: boolean;
    // Make all text on a page transparent to only focus on the layout
    enableLayoutTesting?: boolean;
    // Hide all scrollbars
    hideScrollBars?: boolean;
    // The resizeDimensions
    resizeDimensions?: ResizeDimensions;
    // The padding that needs to be added to the tool bar on iOS and Android
    toolBarShadowPadding?: number;
    // Elements that need to be hidden (visibility: hidden) before saving a screenshot
    hideElements?: HTMLElement[];
    // Elements that need to be removed (display: none) before saving a screenshot
    removeElements?: HTMLElement[];
    // Wait for the fonts to be loaded
    waitForFontsLoaded?: boolean;
}

export interface CheckElementMethodOptions extends SaveElementMethodOptions, CheckMethodOptions { }

export interface CheckElementOptions {
    wic: DefaultOptions;
    method: CheckElementMethodOptions;
}

export type WicElement = WebdriverIO.Element | ChainablePromiseElement
