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
    TestContext,
    InstanceData,
} from 'webdriver-image-comparison'
import type { ChainablePromiseElement } from 'webdriverio'
import type { ContextManager } from './contextManager.js'

type MultiOutput = {
    [browserName: string]: ScreenshotOutput;
};
export type Output = MultiOutput | ScreenshotOutput;
type MultiResult = {
    [browserName: string]: ImageCompareResult | number;
};
export type Result = MultiResult | (ImageCompareResult | number);
export type MobileInstanceData = {
    devicePixelRatio: number;
    deviceRectangles: DeviceRectangles;
}
export type getFolderMethodOptions =
    | CheckElementMethodOptions
    | CheckFullPageMethodOptions
    | CheckScreenMethodOptions
    | SaveElementMethodOptions
    | SaveFullPageMethodOptions
    | SaveScreenMethodOptions;
export type GetInstanceDataOptions = {
    currentBrowser: WebdriverIO.Browser,
    initialDeviceRectangles: DeviceRectangles,
    isNativeContext: boolean
}
export type EnrichTestContextOptions = {
    commandName: string;
    currentTestContext: TestContext;
    instanceData: InstanceData;
    tag: string;
}
export type GetMobileInstanceDataOptions = {
    currentBrowser: WebdriverIO.Browser;
    initialDeviceRectangles: DeviceRectangles;
    isNativeContext:boolean;
    nativeWebScreenshot:boolean;
}

export interface WrapWithContextOptions<T extends (...args: any[]) => any> {
    browser: WebdriverIO.Browser
    command: T
    contextManager: ContextManager
    getArgs: () => Parameters<T>
}

export interface WdioIcsOptions {
    logName?: string;
    name?: string;
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
