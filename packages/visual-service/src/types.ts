import type {
    ScreenshotOutput,
    ImageCompareResult,
    CheckScreenMethodOptions,
    SaveScreenMethodOptions,
    CheckElementMethodOptions,
    SaveElementMethodOptions,
    CheckFullPageMethodOptions,
    SaveFullPageMethodOptions,
    ClassOptions,
    DeviceRectangles,
} from 'webdriver-image-comparison'
import type { ChainablePromiseElement } from 'webdriverio'

type MultiOutput = {
    [browserName: string]: ScreenshotOutput;
};
export type Output = MultiOutput | ScreenshotOutput;
type MultiResult = {
    [browserName: string]: ImageCompareResult | number;
};
export type Result = MultiResult | (ImageCompareResult | number);
export type NativeContextType = boolean | Record<string, boolean>
export type MultiremoteCommandResult = {
        command: string,
        method: string,
        endpoint: string,
        body: Record<string, any>,
        result: { value: string },
        sessionId: string | undefined,
        cid: string,
        type: string,
}
export type RectBounds = { x: number, y: number, width: number, height: number }
export type MobileInstanceData = {
    devicePixelRatio: number;
    devicePlatformRect: {
        statusBar: { height: number; x: number; width: number; y: number };
        homeBar: { height: number; x: number; width: number; y: number };
    };
    deviceRectangles: DeviceRectangles
    deviceScreenSize: { height: number; width: number };
}

export interface WdioIcsCommonOptions {
    hideElements?: (WebdriverIO.Element | ChainablePromiseElement)[];
    removeElements?: (WebdriverIO.Element | ChainablePromiseElement)[];
}

export interface WdioIcsScrollOptions extends WdioIcsCommonOptions {
    hideAfterFirstScroll?: (WebdriverIO.Element | ChainablePromiseElement)[];
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

export interface VisualServiceOptions extends ClassOptions {}
