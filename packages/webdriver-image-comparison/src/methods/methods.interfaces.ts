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
interface BrowsingContextCaptureScreenshotParameters {
    context: string;
    origin?: 'viewport' | 'document';
    format?: {type: string; quality?: number;};
    clip?: { type: 'box'; x: number; y: number; width: number; height: number;};
}
export type BidiScreenshot = (options: BrowsingContextCaptureScreenshotParameters) => Promise<{ data: string }>;
export type Executor = ExecuteScript & ExecuteMobile;
export type GetElementRect = (elementId: string) => Promise<RectanglesOutput>;
export type GetWindowHandle = () => Promise<string>;
export type TakeScreenShot = () => Promise<string>;
export type TakeElementScreenshot = (elementId: string) => Promise<string>;

export interface Methods {
    // The method to take a bidi screenshot
    bidiScreenshot?: BidiScreenshot;
    // The method to inject JS in the running instance
    executor: Executor;
    // Get the element rectangles
    getElementRect?: GetElementRect
    // The method to get the window handle
    getWindowHandle?: GetWindowHandle;
    // The screenshot method
    screenShot: TakeScreenShot;
    // The method to take an element screenshot
    takeElementScreenshot?: TakeElementScreenshot;
}
