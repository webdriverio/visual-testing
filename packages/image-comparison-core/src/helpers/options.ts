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
import type { BeforeScreenshotOptions } from './beforeScreenshot.interfaces.js'
import type { AfterScreenshotOptions } from './afterScreenshot.interfaces.js'
import type { BeforeScreenshotResult } from './beforeScreenshot.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import {
    logAllDeprecatedCompareOptions,
    isStorybook,
    getBooleanOption,
    createConditionalProperty,
    getMethodOrWicOption,
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

/**
 * Creates BeforeScreenshotOptions by extracting common options from method and wic configurations
 */
export function createBeforeScreenshotOptions(
    instanceData: any,
    methodOptions: {
        hideElements?: HTMLElement[]
        removeElements?: HTMLElement[]
        disableBlinkingCursor?: boolean
        disableCSSAnimation?: boolean
        enableLayoutTesting?: boolean
        hideScrollBars?: boolean
        waitForFontsLoaded?: boolean
    },
    wicOptions: {
        addressBarShadowPadding: number
        toolBarShadowPadding: number
        disableBlinkingCursor?: boolean
        disableCSSAnimation?: boolean
        enableLayoutTesting?: boolean
        hideScrollBars?: boolean
        waitForFontsLoaded?: boolean
    }
): BeforeScreenshotOptions {
    return {
        instanceData,
        addressBarShadowPadding: wicOptions.addressBarShadowPadding,
        disableBlinkingCursor: getMethodOrWicOption(methodOptions, wicOptions, 'disableBlinkingCursor') || false,
        disableCSSAnimation: getMethodOrWicOption(methodOptions, wicOptions, 'disableCSSAnimation') || false,
        enableLayoutTesting: getMethodOrWicOption(methodOptions, wicOptions, 'enableLayoutTesting') || false,
        hideElements: methodOptions.hideElements || [],
        noScrollBars: getMethodOrWicOption(methodOptions, wicOptions, 'hideScrollBars') || false,
        removeElements: methodOptions.removeElements || [],
        toolBarShadowPadding: wicOptions.toolBarShadowPadding,
        waitForFontsLoaded: getMethodOrWicOption(methodOptions, wicOptions, 'waitForFontsLoaded') || false,
    }
}

export interface BuildAfterScreenshotOptionsInput {
    // Required inputs
    base64Image: string
    folders: { actualFolder: string }
    tag: string
    isNativeContext: boolean
    instanceData: InstanceData
    wicOptions: {
        formatImageName: string
        savePerInstance: boolean
    }

    // Optional inputs (for web commands)
    enrichedInstanceData?: BeforeScreenshotResult
    beforeOptions?: BeforeScreenshotOptions
}

/**
 * Builds AfterScreenshotOptions consistently across all commands
 * Handles differences between native and web commands automatically
 */
export function buildAfterScreenshotOptions({
    base64Image,
    folders,
    tag,
    isNativeContext,
    instanceData,
    enrichedInstanceData,
    beforeOptions,
    wicOptions
}: BuildAfterScreenshotOptionsInput): AfterScreenshotOptions {
    // Use enriched data when available (web commands), fallback to instance data (native commands)
    const dataSource = enrichedInstanceData || instanceData

    // Extract common properties with smart fallbacks
    const {
        browserName,
        browserVersion,
        deviceName,
        platformName,
        platformVersion,
    } = dataSource

    // Handle dimension data - enriched data has nested structure, instance data is flat
    const dimensions = enrichedInstanceData?.dimensions?.window
    const devicePixelRatio = dimensions?.devicePixelRatio ?? instanceData.devicePixelRatio
    const isLandscape = dimensions?.isLandscape ?? false
    const outerHeight = dimensions?.outerHeight
    const outerWidth = dimensions?.outerWidth
    const screenHeight = dimensions?.screenHeight ?? instanceData.deviceRectangles?.screenSize?.height
    const screenWidth = dimensions?.screenWidth ?? instanceData.deviceRectangles?.screenSize?.width

    // Handle metadata with smart defaults
    const isMobile = enrichedInstanceData?.isMobile ?? instanceData.isMobile
    const isTestInBrowser = enrichedInstanceData?.isTestInBrowser ?? !isNativeContext
    const logName = enrichedInstanceData?.logName ?? instanceData.logName
    const name = enrichedInstanceData?.name ?? instanceData.name

    const { formatImageName, savePerInstance } = wicOptions

    const afterOptions: AfterScreenshotOptions = {
        actualFolder: folders.actualFolder,
        base64Image,
        filePath: {
            browserName,
            deviceName,
            isMobile,
            savePerInstance,
        },
        fileName: {
            browserName,
            browserVersion,
            deviceName,
            devicePixelRatio: devicePixelRatio || NaN,
            formatImageName,
            isMobile,
            isTestInBrowser,
            logName,
            name,
            outerHeight: outerHeight || NaN,
            outerWidth: outerWidth || NaN,
            platformName,
            platformVersion,
            screenHeight: screenHeight || NaN,
            screenWidth: screenWidth || NaN,
            tag,
        },
        isLandscape,
        isNativeContext,
        platformName: instanceData.platformName,
    }

    // Add browser state options only for web commands (when beforeOptions is provided)
    if (beforeOptions) {
        afterOptions.disableBlinkingCursor = beforeOptions.disableBlinkingCursor
        afterOptions.disableCSSAnimation = beforeOptions.disableCSSAnimation
        afterOptions.enableLayoutTesting = beforeOptions.enableLayoutTesting
        afterOptions.hideElements = beforeOptions.hideElements
        afterOptions.hideScrollBars = beforeOptions.noScrollBars
        afterOptions.removeElements = beforeOptions.removeElements
    }

    return afterOptions
}

