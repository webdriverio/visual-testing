import type { BaseMobileWebScreenshotOptions, BaseWebScreenshotOptions, Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'

export interface SaveScreenOptions {
    wic: DefaultOptions;
    method: SaveScreenMethodOptions;
}

export interface SaveScreenMethodOptions extends Partial<Folders>, BaseWebScreenshotOptions, BaseMobileWebScreenshotOptions {
    /**
     * Padding in device pixels added to each side of viewport ignore regions (makes each region 2× this value wider and higher).
     * Helps avoid 1px boundary differences on high-DPR / BiDi. Set to 0 to disable.
     * @default 1
     */
    ignoreRegionPadding?: number;
}

export interface CheckScreenMethodOptions extends SaveScreenMethodOptions, CheckMethodOptions { }

export interface CheckScreenOptions {
    wic: DefaultOptions;
    method: CheckScreenMethodOptions;
}
