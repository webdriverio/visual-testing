import type { Folders } from '../base.interfaces'
import type { DefaultOptions } from '../helpers/options.interfaces'
import type { ResizeDimensions } from '../methods/images.interfaces'
import type { CheckMethodOptions } from './check.interfaces'

export interface SaveFullPageOptions {
    wic: DefaultOptions;
    method: SaveFullPageMethodOptions;
}

export interface SaveFullPageMethodOptions extends Partial<Folders> {
    // The padding that needs to be added to the address bar on iOS and Android
    addressBarShadowPadding?: number;
    // Disable all css animations
    disableCSSAnimation?: boolean;
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
}

export interface CheckFullPageMethodOptions extends SaveFullPageMethodOptions, CheckMethodOptions { }

export interface CheckFullPageOptions {
    wic: DefaultOptions;
    method: CheckFullPageMethodOptions;
}
