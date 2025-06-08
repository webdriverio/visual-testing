import getElementPositionTopDom from '../clientSideScripts/getElementPositionTopDom.js'
import type { ElementPosition } from '../clientSideScripts/elementPosition.interfaces.js'
import { getBoundingClientRect } from '../clientSideScripts/getBoundingClientRect.js'
import type { DeviceRectangles } from './rectangles.interfaces.js'
import { browser } from '@wdio/globals'

/**
 * Get the element position on a Android device
 */
export async function getElementPositionAndroid(
    element: HTMLElement,
    { deviceRectangles, isAndroidNativeWebScreenshot }: {
        deviceRectangles: DeviceRectangles,
        isAndroidNativeWebScreenshot: boolean;
    },
): Promise<ElementPosition> {
    // This is the native web screenshot
    if (isAndroidNativeWebScreenshot) {
        return getElementWebviewPosition(element,  { deviceRectangles } )
    }

    // This is the ChromeDriver screenshot
    return browser.execute(getBoundingClientRect, element)
}

/**
 * Get the element position on a desktop browser
 */
export async function getElementPositionDesktop(
    element: HTMLElement,
    { innerHeight, screenshotHeight }: { innerHeight: number; screenshotHeight: number },
): Promise<ElementPosition> {
    if (screenshotHeight > innerHeight) {
        return browser.execute(getElementPositionTopDom, element)
    }

    return browser.execute(getBoundingClientRect, element)
}

/**
 * Get the element position calculated from the webview
 */
export async function getElementWebviewPosition(
    element: HTMLElement,
    { deviceRectangles: { viewport:{ x, y } } }: { deviceRectangles: DeviceRectangles },
): Promise<ElementPosition> {
    const { height, width, x:boundingClientX, y:boundingClientY } = (await browser.execute(getBoundingClientRect, element)) as ElementPosition

    return {
        height,
        width,
        x: boundingClientX + x,
        y: boundingClientY + y,
    }
}
