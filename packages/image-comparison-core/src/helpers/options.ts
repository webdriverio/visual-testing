import {
    DEFAULT_COMPARE_OPTIONS,
    DEFAULT_FORMAT_STRING,
    DEFAULT_SHADOW,
    DEFAULT_TABBABLE_OPTIONS,
    FULL_PAGE_SCROLL_TIMEOUT,
    STORYBOOK_FORMAT_STRING,
} from './constants.js'
import type { ClassOptions, DefaultOptions } from './options.interfaces.js'
import type { MethodImageCompareCompareOptions, ScreenMethodImageCompareCompareOptions } from '../methods/images.interfaces.js'
import {
    logAllDeprecatedCompareOptions,
    isStorybook,
    getBooleanOption,
    createConditionalProperty,
} from './utils.js'

/**
 * Determine the default options by merging user options with sensible defaults
 */
export function defaultOptions(options: ClassOptions): DefaultOptions {
    const isStorybookMode = isStorybook()

    return {
        /**
         * Module-specific options
         */
        addressBarShadowPadding: options.addressBarShadowPadding ?? DEFAULT_SHADOW.ADDRESS_BAR,
        autoElementScroll: getBooleanOption(options, 'autoElementScroll', true),
        addIOSBezelCorners: options.addIOSBezelCorners ?? false,
        autoSaveBaseline: options.autoSaveBaseline ?? true,
        clearFolder: options.clearRuntimeFolder ?? false,
        userBasedFullPageScreenshot: options.userBasedFullPageScreenshot ?? false,
        enableLegacyScreenshotMethod: options.enableLegacyScreenshotMethod ?? false,
        formatImageName: options.formatImageName ?? (isStorybookMode ? STORYBOOK_FORMAT_STRING : DEFAULT_FORMAT_STRING),
        isHybridApp: options.isHybridApp ?? false,
        // Running in storybook mode with multiple browsers can generate many images
        // Defaulting this to true provides better overview for users
        savePerInstance: options.savePerInstance ?? isStorybookMode,
        toolBarShadowPadding: options.toolBarShadowPadding ?? DEFAULT_SHADOW.TOOL_BAR,

        /**
         * Module and method options
         */
        disableBlinkingCursor: options.disableBlinkingCursor ?? false,
        disableCSSAnimation: options.disableCSSAnimation ?? false,
        enableLayoutTesting: options.enableLayoutTesting ?? false,
        fullPageScrollTimeout: options.fullPageScrollTimeout ?? FULL_PAGE_SCROLL_TIMEOUT,
        // Default to false for storybook mode as element screenshots use W3C protocol without scrollbars
        // This also saves an extra webdriver call
        hideScrollBars: getBooleanOption(options, 'hideScrollBars', !isStorybookMode),
        waitForFontsLoaded: options.waitForFontsLoaded ?? true,

        /**
         * Compare options (merged sequentially):
         * 1. Default options (fallback)
         * 2. Root compareOptions (deprecated but supported)
         * 3. User-provided compareOptions
         */
        compareOptions: {
            ...DEFAULT_COMPARE_OPTIONS,
            ...logAllDeprecatedCompareOptions(options),
            ...options.compareOptions,
        },

        /**
         * Tabbable options with deep merging
         */
        tabbableOptions: {
            circle: {
                ...DEFAULT_TABBABLE_OPTIONS.circle,
                ...options.tabbableOptions?.circle,
            },
            line: {
                ...DEFAULT_TABBABLE_OPTIONS.line,
                ...options.tabbableOptions?.line,
            },
        },
    }
}

/**
 * Determine the screen method compare options with proper type safety
 */
export function screenMethodCompareOptions(
    options: ScreenMethodImageCompareCompareOptions,
): ScreenMethodImageCompareCompareOptions {
    return {
        ...createConditionalProperty('blockOutSideBar' in options, 'blockOutSideBar', options.blockOutSideBar),
        ...createConditionalProperty('blockOutStatusBar' in options, 'blockOutStatusBar', options.blockOutStatusBar),
        ...createConditionalProperty('blockOutToolBar' in options, 'blockOutToolBar', options.blockOutToolBar),
        ...methodCompareOptions(options),
    }
}

/**
 * Determine the method compare options with improved type safety
 */
export function methodCompareOptions(options: MethodImageCompareCompareOptions): MethodImageCompareCompareOptions {
    const compareOptionKeys: (keyof MethodImageCompareCompareOptions)[] = [
        'blockOut',
        'ignoreAlpha',
        'ignoreAntialiasing',
        'ignoreColors',
        'ignoreLess',
        'ignoreNothing',
        'rawMisMatchPercentage',
        'returnAllCompareData',
        'saveAboveTolerance',
        'scaleImagesToSameSize',
    ]

    return compareOptionKeys.reduce((result, key) => {
        if (key in options && options[key] !== undefined) {
            result[key] = options[key] as any // Type assertion needed due to union types
        }
        return result
    }, {} as MethodImageCompareCompareOptions)
}

