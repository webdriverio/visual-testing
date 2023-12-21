import type { ElementPosition } from './elementPosition.interfaces'

/**
 * Get the element position to the top of the screen of the device, not the top of the webview
 * This method is used for Android native and iOS screenshots
 */
export function getElementPositionTopScreenNativeMobile(
    element: HTMLElement,
    {
        isLandscape,
        safeArea,
        screenHeight,
        screenWidth,
        sideBarWidth,
        statusBarAddressBarHeight,
    }: {
        isLandscape: boolean;
        safeArea: number;
        screenHeight: number;
        screenWidth: number;
        sideBarWidth: number;
        statusBarAddressBarHeight: number;
    },
): ElementPosition {
    // Get some heights and widths
    const { innerHeight } = window

    // Determine element position
    const elementPosition = element.getBoundingClientRect()
    const y = (screenHeight === innerHeight || screenWidth === innerHeight)
        ? elementPosition.top
        : statusBarAddressBarHeight + elementPosition.top

    return {
        height: elementPosition.height,
        width: elementPosition.width,
        x: elementPosition.left + (isLandscape ? safeArea : 0) + sideBarWidth,
        y: y,
    }
}
