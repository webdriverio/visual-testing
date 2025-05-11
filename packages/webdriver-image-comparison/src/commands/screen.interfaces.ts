import type { Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'

export interface SaveScreenOptions {
    wic: DefaultOptions;
    method: SaveScreenMethodOptions;
}

export interface SaveScreenMethodOptions extends Partial<Folders> {
    // Disable the blinking cursor
    disableBlinkingCursor?: boolean;
    // Disable all css animations
    disableCSSAnimation?: boolean;
    // Make all text on a page transparent to only focus on the layout
    enableLayoutTesting?: boolean;
    // By default the screenshots are taken with the BiDi protocol if Bidi is available.
    // If you want to use the legacy method, set this to true.
    enableLegacyScreenshotMethod?: boolean;
    // Hide scrollbars, this is optional
    hideScrollBars?: boolean;
    // Elements that need to be hidden (visibility: hidden) before saving a screenshot
    hideElements?: HTMLElement[];
    // Elements that need to be removed (display: none) before saving a screenshot
    removeElements?: HTMLElement[];
    // Wait for the fonts to be loaded
    waitForFontsLoaded?: boolean;
}

export interface CheckScreenMethodOptions extends SaveScreenMethodOptions, CheckMethodOptions { }

export interface CheckScreenOptions {
    wic: DefaultOptions;
    method: CheckScreenMethodOptions;
}
