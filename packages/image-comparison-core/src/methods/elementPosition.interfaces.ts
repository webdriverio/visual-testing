import type { DeviceRectangles } from './rectangles.interfaces.js'

export interface GetElementPositionDesktopOptions {
    /** The inner height of the screen */
    innerHeight: number;
    /** The screenshot height */
    screenshotHeight: number;
}

export interface GetElementPositionAndroidOptions {
    /** The device rectangles */
    deviceRectangles: DeviceRectangles;
    /** Is the device Android */
    isAndroidNativeWebScreenshot: boolean;
}