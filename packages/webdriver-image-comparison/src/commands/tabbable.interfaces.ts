import type { DefaultOptions } from '../helpers/options.interfaces'
import type { CheckFullPageMethodOptions, SaveFullPageMethodOptions } from './fullPage.interfaces'

export interface SaveTabbableOptions {
    wic: DefaultOptions;
    method: SaveFullPageMethodOptions;
}
export interface CheckTabbableOptions {
    wic: DefaultOptions;
    method: CheckFullPageMethodOptions;
}

export interface TabbableOptions {
    circle?: CircleOptions;
    line?: LineOptions;
}
export interface CircleOptions {
    backgroundColor?: string;
    borderColor?: string;
    borderWidth?: number;
    fontColor?: string;
    fontFamily?: string;
    fontSize?: number;
    size?: number;
    showNumber?: boolean;
}
export interface LineOptions {
    color?: string;
    width?: number;
}
