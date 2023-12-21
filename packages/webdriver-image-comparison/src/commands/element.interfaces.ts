import type { Folders } from '../base.interface'
import type { DefaultOptions } from '../helpers/options.interface'
import type { ResizeDimensions } from '../methods/images.interfaces'
import type { CheckMethodOptions } from './check.interfaces'

export interface SaveElementOptions {
    wic: DefaultOptions;
    method: SaveElementMethodOptions;
}

export interface SaveElementMethodOptions extends Partial<Folders> {
    // The padding that needs to be added to the address bar on iOS and Android
    addressBarShadowPadding?: number;
    // Disable all css animations
    disableCSSAnimation?: boolean;
    // Hide all scrollbars
    hideScrollBars?: boolean;
    // The resizeDimensions, for backwards compatibility this will be an object or a number
    resizeDimensions?: ResizeDimensions | number;
    // The padding that needs to be added to the tool bar on iOS and Android
    toolBarShadowPadding?: number;
    // Elements that need to be hidden (visibility: hidden) before saving a screenshot
    hideElements?: HTMLElement[];
    // Elements that need to be removed (display: none) before saving a screenshot
    removeElements?: HTMLElement[];
}

export interface CheckElementMethodOptions extends SaveElementMethodOptions, CheckMethodOptions { }

export interface CheckElementOptions {
    wic: DefaultOptions;
    method: CheckElementMethodOptions;
}
