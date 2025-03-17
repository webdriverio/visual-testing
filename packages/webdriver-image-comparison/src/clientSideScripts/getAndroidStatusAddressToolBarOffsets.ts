import type { StatusAddressToolBarOffsets } from './statusAddressToolBarOffsets.interfaces.js'
import type { AndroidOffsets } from '../helpers/constants.interfaces.js'

/**
 * Get the current height of the Android status and address bar
 */
export default function getAndroidStatusAddressToolBarOffsets(
    androidOffsets: AndroidOffsets,
    { isHybridApp, isLandscape }: { isHybridApp: boolean; isLandscape: boolean },
): StatusAddressToolBarOffsets {
    // Determine version for the right offsets
    const { height, width } = window.screen
    const { innerHeight } = window
    const match = navigator.appVersion.match(/Android (\d+).?(\d+)?.?(\d+)?/)!
    const majorVersion = parseInt(match[1], 10)
    const versionOffsets = androidOffsets[majorVersion]
    // Not sure if it's a bug, but in Landscape mode the height is the width
    const deviceHeight = isLandscape && width > height ? width : height
    const deviceWidth = isLandscape && height > width ? height : width
    const statusAddressBarHeight = versionOffsets.STATUS_BAR + (isHybridApp ? 0 : versionOffsets.ADDRESS_BAR)
    let toolBarHeight = height - innerHeight - statusAddressBarHeight

    if (toolBarHeight < 0) {
        toolBarHeight = versionOffsets.TOOL_BAR
    }

    // Determine status, address and tool bar height
    return {
        // For now Android doesn't have a safe area
        safeArea: 0,
        screenHeight: deviceHeight,
        screenWidth: deviceWidth,
        statusAddressBar: {
            height: statusAddressBarHeight,
            width,
            x: 0,
            y: 0,
        },
        // For now Android doesn't have a side bar
        leftSidePadding: { height: 0, width: 0, x: 0, y: 0 },
        rightSidePadding: { height: 0, width: 0, x: 0, y: 0 },
        toolBar: {
            height: toolBarHeight,
            width,
            x: 0,
            y: height - toolBarHeight,
        },
    }
}
