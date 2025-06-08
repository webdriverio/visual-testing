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
    InternalSaveScreenMethodOptions,
    InternalCheckTabbablePageMethodOptions,
    InternalSaveElementMethodOptions,
    InternalSaveFullPageMethodOptions,
    InternalSaveTabbablePageMethodOptions,
    InternalCheckScreenMethodOptions,
    InternalCheckElementMethodOptions,
    InternalCheckFullPageMethodOptions,
} from '@wdio/image-comparison-core'
import type { ChainablePromiseElement } from 'webdriverio'
import type { ContextManager } from './contextManager.js'
import type { WaitForStorybookComponentToBeLoaded } from './storybook/Types.js'

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
    browserInstance: WebdriverIO.Browser,
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
    browserInstance: WebdriverIO.Browser;
    initialDeviceRectangles: DeviceRectangles;
    isNativeContext:boolean;
    nativeWebScreenshot:boolean;
}

export interface WrapWithContextOptions<T extends (...args: any[]) => any> {
    browserInstance: WebdriverIO.Browser
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

// Save methods
export interface WdioSaveScreenMethodOptions extends Omit<SaveScreenMethodOptions, keyof WdioIcsCommonOptions>, WdioIcsCommonOptions {}
export interface WdioSaveElementMethodOptions extends Omit<SaveElementMethodOptions, keyof WdioIcsCommonOptions>, WdioIcsCommonOptions {}
export interface WdioSaveFullPageMethodOptions extends Omit<SaveFullPageMethodOptions, keyof WdioIcsScrollOptions>, WdioIcsScrollOptions { }

// Check methods
export interface WdioCheckScreenMethodOptions extends Omit<CheckScreenMethodOptions, keyof WdioIcsCommonOptions>, WdioIcsCommonOptions {}
export interface WdioCheckElementMethodOptions extends Omit<CheckElementMethodOptions, keyof WdioIcsCommonOptions>, WdioIcsCommonOptions {}
export interface WdioCheckFullPageMethodOptions extends Omit<CheckFullPageMethodOptions, keyof WdioIcsScrollOptions>, WdioIcsScrollOptions {}

export interface VisualServiceOptions extends ClassOptions { }

export interface CommandMap {
    saveScreen: (options: InternalSaveScreenMethodOptions) => Promise<Output>
    saveElement: (options: InternalSaveElementMethodOptions) => Promise<Output>
    saveFullPageScreen: (options: InternalSaveFullPageMethodOptions) => Promise<Output>
    saveTabbablePage: (options: InternalSaveTabbablePageMethodOptions) => Promise<Output>
    checkScreen: (options: InternalCheckScreenMethodOptions) => Promise<Result>
    checkElement: (options: InternalCheckElementMethodOptions) => Promise<Result>
    checkFullPageScreen: (options: InternalCheckFullPageMethodOptions) => Promise<Result>
    checkTabbablePage: (options: InternalCheckTabbablePageMethodOptions) => Promise<Result>
    // Storybook commands
    waitForStorybookComponentToBeLoaded: (options: WaitForStorybookComponentToBeLoaded) => Promise<void>
}
