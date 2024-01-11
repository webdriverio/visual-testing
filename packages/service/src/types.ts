import type {
    ScreenshotOutput,
    ImageCompareResult,
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
    CheckElementMethodOptions,
    SaveElementMethodOptions,
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
} from 'webdriver-image-comparison'

type MultiOutput = {
    [browserName: string]: ScreenshotOutput;
};
export type Output = MultiOutput | ScreenshotOutput;
type MultiResult = {
    [browserName: string]: ImageCompareResult | number;
};
export type Result = MultiResult | (ImageCompareResult | number);

export interface WdioIcsCommonOptions {
    hideElements?: WebdriverIO.Element[];
    removeElements?: WebdriverIO.Element[];
}
export interface WdioIcsScrollOptions extends WdioIcsCommonOptions {
    hideAfterFirstScroll?: WebdriverIO.Element[];
}

export interface WdioCheckFullPageMethodOptions
    extends Omit<CheckFullPageMethodOptions, keyof WdioIcsScrollOptions>,
        WdioIcsScrollOptions {}
export interface WdioSaveFullPageMethodOptions
    extends Omit<SaveFullPageMethodOptions, keyof WdioIcsScrollOptions>,
        WdioIcsScrollOptions {}
export interface WdioSaveElementMethodOptions
    extends Omit<SaveElementMethodOptions, keyof WdioIcsCommonOptions>,
        WdioIcsCommonOptions {}
export interface WdioSaveScreenMethodOptions
    extends Omit<SaveScreenMethodOptions, keyof WdioIcsCommonOptions>,
        WdioIcsCommonOptions {}
export interface WdioCheckElementMethodOptions
    extends Omit<CheckElementMethodOptions, keyof WdioIcsCommonOptions>,
        WdioIcsCommonOptions {}
export interface WdioCheckScreenMethodOptions
    extends Omit<CheckScreenMethodOptions, keyof WdioIcsCommonOptions>,
        WdioIcsCommonOptions {}
