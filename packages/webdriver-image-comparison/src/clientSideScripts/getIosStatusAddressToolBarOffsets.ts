import type { StatusAddressToolBarOffsets } from './statusAddressToolBarOffsets.interfaces.js'
import type { IosOffsets } from '../helpers/constants.interfaces.js'

/**
 * Get the current height of the iOS status and address bar
 */
export default function getIosStatusAddressToolBarOffsets(
    iosOffsets: IosOffsets,
    isLandscape: boolean,
): StatusAddressToolBarOffsets {
    // 1. Determine screen width/height to determine the current iPhone/iPad offset data
    //    For data on the screen sizes check the constants.ts-file
    const { width, height } = window.screen
    const { innerHeight } = window
    const isIphone = width < 1024 && height < 1024
    const deviceType = isIphone ? 'IPHONE' : 'IPAD'
    const orientationType = isLandscape ? 'LANDSCAPE' : 'PORTRAIT'
    const defaultPortraitHeight = isIphone ? 667 : 1024
    const portraitHeight = width > height ? width : height
    // Not sure if it's a bug, but in Landscape mode the height is the width
    const deviceHeight = isLandscape ? width : height
    const deviceWidth = isLandscape ? height : width
    const offsetPortraitHeight =
        Object.keys(iosOffsets[deviceType]).indexOf(portraitHeight.toString()) > -1 ? portraitHeight : defaultPortraitHeight
    const currentOffsets = iosOffsets[deviceType][offsetPortraitHeight][orientationType]
    const osVersion = parseInt(navigator.appVersion.match(/(?:OS |Version\/)(\d+)(?:_|\.)(\d+)(?:_|\.)?(\d+)?/)![1], 10)

    // 2. Get the statusbar height
    let statusBarHeight = currentOffsets.STATUS_BAR
    let isIpadPro129FirstGeneration = false
    let safeArea = currentOffsets.SAFE_AREA
    /**
   * Dirty little hack, but the status bar of the iPad Pro (12.9 inch) (1st generation)
   * has a status bar of 20px I wanted the data to be as generic as possible, so I added this hack
   */
    if (
        (deviceHeight === 1366 || deviceWidth === 1366) &&
        deviceType === 'IPAD' &&
        innerHeight + currentOffsets.ADDRESS_BAR + currentOffsets.STATUS_BAR > deviceHeight
    ) {
        statusBarHeight = 20
        isIpadPro129FirstGeneration = true
    }
    /**
   * Dirty little hack for iPhone XSMax|XR|11|11ProMax for iOS 13. The status bar is 44 when in
   * portrait mode and the safe area is 44 when in landscape mode
   */
    if ((deviceHeight === 896 || deviceWidth === 896) && deviceType === 'IPHONE' && osVersion === 13) {
        if (isLandscape) {
            safeArea = 44
        } else {
            statusBarHeight = 44
        }
    }
    // 3. Determine the address bar height
    //    Since iOS 15 the address bar for iPhones is at the bottom by default
    //    This is also what we assume because we can't determine it from the
    //    web context
    const addressBarOnTop = (!isLandscape && isIphone && osVersion < 15) || isLandscape || !isIphone
    const statusAddressBarHeight = statusBarHeight + (addressBarOnTop ? currentOffsets.ADDRESS_BAR : 0)
    // 4. Determine the toolbar offsets
    //    In Landscape mode the toolbar is hidden by default and we need to add
    //    home bar data
    const toolBarHeight = height - innerHeight - statusAddressBarHeight
    const toolBarOffsets =
        isLandscape || toolBarHeight <= 0
            ? // The iPad Pro (12.9 inch) (1st generation) doesn't have a home bar
            isIpadPro129FirstGeneration
                ? { height: 0, width: 0, x: 0, y: 0 }
                : currentOffsets.HOME_BAR
            : {
                height: toolBarHeight,
                width: deviceWidth,
                x: 0,
                y: height - toolBarHeight,
            }
    // 5. Return the sidebar offsets
    const sideBarOffsets =
        isLandscape && !isIphone
            ? {
                height: deviceHeight - statusAddressBarHeight,
                width: deviceWidth - document.documentElement.scrollWidth,
                x: 0,
                y: statusAddressBarHeight,
            }
            : { height: 0, width: 0, x: 0, y: 0 }

    // 6. Return the offsets
    return {
        // we don't have a left side bar for now, so default to 0
        leftSidePadding: { height: 0, width: 0, x: 0, y: 0 },
        // We only have a side bar with iPads and in landscape mode
        rightSidePadding: sideBarOffsets,
        safeArea,
        screenHeight: deviceHeight,
        screenWidth: deviceWidth,
        statusAddressBar: {
            height: statusAddressBarHeight,
            width: deviceWidth,
            x: 0,
            y: 0,
        },
        toolBar: toolBarOffsets,
    }
}
