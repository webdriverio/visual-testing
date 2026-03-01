import type { BaseMobileWebScreenshotOptions, BaseWebScreenshotOptions, Folders } from '../base.interfaces.js'
import type { DefaultOptions } from '../helpers/options.interfaces.js'
import type { CheckMethodOptions } from './check.interfaces.js'

export interface SaveScreenOptions {
    wic: DefaultOptions;
    method: SaveScreenMethodOptions;
}

export interface SaveScreenMethodOptions extends Partial<Folders>, BaseWebScreenshotOptions, BaseMobileWebScreenshotOptions {
}

export interface CheckScreenMethodOptions extends SaveScreenMethodOptions, CheckMethodOptions { }

export interface CheckScreenOptions {
    wic: DefaultOptions;
    method: CheckScreenMethodOptions;
}
