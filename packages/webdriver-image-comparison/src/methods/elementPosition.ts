import getElementPositionTopDom from '../clientSideScripts/getElementPositionTopDom.js'
import type { Executor } from './methods.interfaces.js'
import type { ElementPosition } from '../clientSideScripts/elementPosition.interfaces.js'
import { getBoundingClientRect } from '../clientSideScripts/getBoundingClientRect.js'
import type { DeviceRectangles } from './instanceData.interfaces.js'

/**
 * Get the element position on a Android device
 */
export async function getElementPositionAndroid(
    executor: Executor,
    element: HTMLElement,
    { deviceRectangles, isAndroidNativeWebScreenshot }: {
        deviceRectangles: DeviceRectangles,
        isAndroidNativeWebScreenshot: boolean;
    },
): Promise<ElementPosition> {
    // This is the native web screenshot
    if (isAndroidNativeWebScreenshot) {
        return getElementWebviewPosition(executor, element,  { deviceRectangles } )
    }

    // This is the ChromeDriver screenshot
    return executor(getBoundingClientRect, element)
}

/**
 * Get the element position on a desktop browser
 *
 * @param {function} executor         The function to execute JS in the browser
 * @param {number}   innerHeight      The inner height of the screen
 * @param {number}   screenshotHeight The screenshot height
 * @param {element}  element          The element
 *
 * @returns {Promise<{
 *    height: number,
 *    width: number,
 *    x: number,
 *    y: number
 * }>}
 */
export async function getElementPositionDesktop(
    executor: Executor,
    element: HTMLElement,
    { innerHeight, screenshotHeight }: { innerHeight: number; screenshotHeight: number },
): Promise<ElementPosition> {
    if (screenshotHeight > innerHeight) {
        return executor(getElementPositionTopDom, element)
    }

    return executor(getBoundingClientRect, element)
}

/**
 * Get the element position calculated from the webview
 */
export async function getElementWebviewPosition(
    executor: Executor,
    element: HTMLElement,
    { deviceRectangles: { viewport:{ left, top } } }: { deviceRectangles: DeviceRectangles },
): Promise<ElementPosition> {
    const { height, width, x, y } = (await executor(getBoundingClientRect, element)) as ElementPosition

    // Now add the viewport offsets
    return {
        height,
        width,
        x: left + x,
        y: top + y,
    }
}
