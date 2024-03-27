import { DEFAULT_FORMAT_STRING, DEFAULT_SHADOW, DEFAULT_TABBABLE_OPTIONS, FULL_PAGE_SCROLL_TIMEOUT, STORYBOOK_FORMAT_STRING } from './constants.js'
import type { ClassOptions, DefaultOptions } from './options.interfaces.js'
import type { MethodImageCompareCompareOptions, ScreenMethodImageCompareCompareOptions } from '../methods/images.interfaces.js'
import { isStorybook } from './utils.js'

/**
 * Determine the default options
 */
export function defaultOptions(options: ClassOptions): DefaultOptions {
    return {
        /**
         * Module options
         */
        addressBarShadowPadding: options.addressBarShadowPadding ?? DEFAULT_SHADOW.ADDRESS_BAR,
        autoElementScroll: Object.prototype.hasOwnProperty.call(options, 'autoElementScroll')
            ? Boolean(options.autoElementScroll)
            : true,
        addIOSBezelCorners: options.addIOSBezelCorners ?? false,
        autoSaveBaseline: options.autoSaveBaseline ?? true,
        clearFolder: options.clearRuntimeFolder ?? false,
        // Storybook will have it's own default format string
        formatImageName: options.formatImageName ?? (isStorybook() ? STORYBOOK_FORMAT_STRING : DEFAULT_FORMAT_STRING),
        isHybridApp: options.isHybridApp ?? false,
        // Running in storybook mode with a min of 2 browsers can cause huge amount of images to be saved
        // by defaulting this to true the user will have a better overview
        savePerInstance: options.savePerInstance ?? (isStorybook() ? true : false),
        toolBarShadowPadding: options.toolBarShadowPadding ?? DEFAULT_SHADOW.TOOL_BAR,

        /**
         * Module and method options
         */
        disableCSSAnimation: options.disableCSSAnimation ?? false,
        enableLayoutTesting: options.enableLayoutTesting ?? false,
        fullPageScrollTimeout: options.fullPageScrollTimeout ?? FULL_PAGE_SCROLL_TIMEOUT,
        hideScrollBars: Object.prototype.hasOwnProperty.call(options, 'hideScrollBars')
            ? Boolean(options.hideScrollBars)
            // Default to false for storybook mode, by default element screenshots are taken with the
            // W3C protocol which will not show the scrollbars. Secondly, it saves an extra webdriver call
            : isStorybook() ? false : true,
        waitForFontsLoaded: options.waitForFontsLoaded ?? true,

        /**
         * Compare options
         */
        compareOptions: {
            blockOutSideBar: options.blockOutSideBar ?? true,
            blockOutStatusBar: options.blockOutStatusBar ?? true,
            blockOutToolBar: options.blockOutToolBar ?? true,
            ignoreAlpha: options.ignoreAlpha ?? false,
            ignoreAntialiasing: options.ignoreAntialiasing ?? false,
            ignoreColors: options.ignoreColors ?? false,
            ignoreLess: options.ignoreLess ?? false,
            ignoreNothing: options.ignoreNothing ?? false,
            rawMisMatchPercentage: options.rawMisMatchPercentage ?? false,
            returnAllCompareData: options.returnAllCompareData ?? false,
            saveAboveTolerance: options.saveAboveTolerance ?? 0,
            scaleImagesToSameSize: options.scaleImagesToSameSize ?? false,
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
