import type { RectanglesOutput } from './rectangles.interfaces'

interface ProtocolCommandResponse {
    [key: string]: any;
}
interface Settings extends ProtocolCommandResponse {
    shouldUseCompactResponses?: boolean,
    elementResponseAttributes?: string,
    ignoreUnimportantViews?: boolean,
    allowInvisibleElements?: boolean,
    enableNotificationListener?: boolean,
    actionAcknowledgmentTimeout?: number,
    keyInjectionDelay?: number,
    scrollAcknowledgmentTimeout?: number,
    waitForIdleTimeout?: number,
    waitForSelectorTimeout?: number,
    normalizeTagNames?: boolean,
    shutdownOnPowerDisconnect?: boolean,
    mjpegServerScreenshotQuality?: number,
    mjpegServerFramerate?: number,
    screenshotQuality?: number,
    mjpegScalingFactor?: number,
}

// eslint-disable-next-line @typescript-eslint/ban-types
export type Executor = <T>(script: string | Function, ...varArgs: any[]) => Promise<T>;
export type GetElementRect = (elementId:string) => Promise<RectanglesOutput>
export type GetSettings = () => Promise<Settings>
export type TakeScreenShot = () => Promise<string>;
export type UpdateSettings =  (settings: Settings) => Promise<void>

export interface Methods {
    // The method to inject JS in the running instance
    executor: Executor;
    // Get the element rectangles
    getElementRect?: GetElementRect
    // Get the settings
    getSettings?: GetSettings ;
    // The screenshot method
    screenShot: TakeScreenShot;
    // Update the settings
    updateSettings?: UpdateSettings;
}
