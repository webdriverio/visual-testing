import { DEFAULT_FORMAT_STRING, DEFAULT_SHADOW, DEFAULT_TABBABLE_OPTIONS, FULL_PAGE_SCROLL_TIMEOUT } from './constants.js'
import type { ClassOptions, DefaultOptions } from './options.interfaces'
import { LogLevel } from './options.interfaces'
import type { MethodImageCompareCompareOptions, ScreenMethodImageCompareCompareOptions } from '../methods/images.interfaces'

/**
 * Determine the default options
 */
export function defaultOptions(options: ClassOptions): DefaultOptions {
    return {
        /**
         * Module options
         */
        addressBarShadowPadding: options.addressBarShadowPadding || DEFAULT_SHADOW.ADDRESS_BAR,
        autoElementScroll: Object.prototype.hasOwnProperty.call(options, 'autoElementScroll')
            ? Boolean(options.autoElementScroll)
            : true,
        addIOSBezelCorners: options.addIOSBezelCorners || false,
        autoSaveBaseline: options.autoSaveBaseline || false,
        clearFolder: options.clearRuntimeFolder || false,
        formatImageName: options.formatImageName || DEFAULT_FORMAT_STRING,
        isHybridApp: options.isHybridApp || false,
        logLevel: options.logLevel || LogLevel.info,
        savePerInstance: options.savePerInstance || false,
        toolBarShadowPadding: options.toolBarShadowPadding || DEFAULT_SHADOW.TOOL_BAR,

        /**
     * Module and method options
     */
        disableCSSAnimation: options.disableCSSAnimation || false,
        fullPageScrollTimeout: options.fullPageScrollTimeout || FULL_PAGE_SCROLL_TIMEOUT,
        hideScrollBars: Object.prototype.hasOwnProperty.call(options, 'hideScrollBars')
            ? Boolean(options.hideScrollBars)
            : true,

        /**
     * Compare options
     */
        compareOptions: {
            blockOutSideBar: !!options.blockOutSideBar,
            blockOutStatusBar: !!options.blockOutStatusBar,
            blockOutToolBar: !!options.blockOutToolBar,
            ignoreAlpha: options.ignoreAlpha || false,
            ignoreAntialiasing: options.ignoreAntialiasing || false,
            ignoreColors: options.ignoreColors || false,
            ignoreLess: options.ignoreLess || false,
            ignoreNothing: options.ignoreNothing || false,
            rawMisMatchPercentage: options.rawMisMatchPercentage || false,
            returnAllCompareData: options.returnAllCompareData || false,
            saveAboveTolerance: options.saveAboveTolerance || 0,
            scaleImagesToSameSize: options.scaleImagesToSameSize || false,
        },

        /**
     * Tabbable options
     */
        tabbableOptions: {
            circle: {
                ...DEFAULT_TABBABLE_OPTIONS.circle,
                ...(options.tabbableOptions && options.tabbableOptions.circle ? options.tabbableOptions.circle : {}),
            },
            line: {
                ...DEFAULT_TABBABLE_OPTIONS.line,
                ...(options.tabbableOptions && options.tabbableOptions.line ? options.tabbableOptions.line : {}),
            },
        },
    }
}

/**
 * Determine the screen method compare options
 */
export function screenMethodCompareOptions(
    options: ScreenMethodImageCompareCompareOptions,
): ScreenMethodImageCompareCompareOptions {
    return {
        ...('blockOutSideBar' in options ? { blockOutSideBar: options.blockOutSideBar } : {}),
        ...('blockOutStatusBar' in options ? { blockOutStatusBar: options.blockOutStatusBar } : {}),
        ...('blockOutToolBar' in options ? { blockOutToolBar: options.blockOutToolBar } : {}),
        ...methodCompareOptions(options),
    }
}

/**
 * Determine the method compare options
 */
export function methodCompareOptions(options: any): MethodImageCompareCompareOptions {
    return {
        ...('blockOut' in options ? { blockOut: options.blockOut } : {}),
        ...('ignoreAlpha' in options ? { ignoreAlpha: options.ignoreAlpha } : {}),
        ...('ignoreAntialiasing' in options ? { ignoreAntialiasing: options.ignoreAntialiasing } : {}),
        ...('ignoreColors' in options ? { ignoreColors: options.ignoreColors } : {}),
        ...('ignoreLess' in options ? { ignoreLess: options.ignoreLess } : {}),
        ...('ignoreNothing' in options ? { ignoreNothing: options.ignoreNothing } : {}),
        ...('rawMisMatchPercentage' in options ? { rawMisMatchPercentage: options.rawMisMatchPercentage } : {}),
        ...('returnAllCompareData' in options ? { returnAllCompareData: options.returnAllCompareData } : {}),
        ...('saveAboveTolerance' in options ? { saveAboveTolerance: options.saveAboveTolerance } : {}),
        ...('scaleImagesToSameSize' in options ? { scaleImagesToSameSize: options.scaleImagesToSameSize } : {}),
    }
}
