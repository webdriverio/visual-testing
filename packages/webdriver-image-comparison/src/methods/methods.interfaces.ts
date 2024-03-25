import type { RectanglesOutput } from './rectangles.interfaces.js'

// eslint-disable-next-line @typescript-eslint/ban-types
export type Executor = <T>(script: string | Function, ...varArgs: any[]) => Promise<T>;
export type GetElementRect = (elementId:string) => Promise<RectanglesOutput>
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
