import type { RectanglesOutput } from './rectangles.interfaces.js'

// There a multiple ways to call the executor method, for mobile and web
type ExecuteScript = <ReturnValue, Args extends unknown[]>(
    fn: (...args: Args) => ReturnValue,
    ...args: Args
  ) => Promise<ReturnValue>;

type ExecuteMobile = <ReturnValue>(
    fn: string,
    args?: Record<string, any>
) => Promise<ReturnValue>;
export type Executor = ExecuteScript & ExecuteMobile;
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
