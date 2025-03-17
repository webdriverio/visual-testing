import type { RectanglesOutput } from './rectangles.interfaces.js'

/** Binding to the `await browser.execute()` method */
export type Executor = <ReturnValue, InnerArguments extends unknown[]>(
    fn: string | ((...args: InnerArguments) => ReturnValue),
    ...args: InnerArguments
) => Promise<ReturnValue>;
export type GetElementRect = (elementId: string) => Promise<RectanglesOutput>
export type TakeScreenShot = () => Promise<string>;
export type TakeElementScreenshot = (elementId: string) => Promise<string>;

export interface Methods {
    // The method to inject JS in the running instance
    executor: Executor;
    // Get the element rectangles
    getElementRect?: GetElementRect
    // The screenshot method
    screenShot: TakeScreenShot;
    // The method to take an element screenshot
    takeElementScreenshot?: TakeElementScreenshot;
}
