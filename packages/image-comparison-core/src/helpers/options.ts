import {
    DEFAULT_COMPARE_OPTIONS,
    DEFAULT_FORMAT_STRING,
    DEFAULT_PIXELMATCH_OPTIONS,
    DEFAULT_SHADOW,
    DEFAULT_TABBABLE_OPTIONS,
    FULL_PAGE_SCROLL_TIMEOUT,
    STORYBOOK_FORMAT_STRING,
} from './constants.js'
import type { ClassOptions, CompareOptions, DefaultOptions } from './options.interfaces.js'
import type { MethodImageCompareCompareOptions, ScreenMethodImageCompareCompareOptions } from '../methods/images.interfaces.js'
import type { BeforeScreenshotOptions, BeforeScreenshotResult } from './beforeScreenshot.interfaces.js'
import type { AfterScreenshotOptions } from './afterScreenshot.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { ComparisonIgnoreOption, PixelmatchCompareOptions, ResolvedPixelmatchOptions } from '../pixelmatch/compare.interfaces.js'
import logger from '@wdio/logger'
import {
    logAllDeprecatedCompareOptions,
    isStorybook,
    getBooleanOption,
    createConditionalProperty,
    getMethodOrWicOption,
} from './utils.js'

const log = logger('@wdio/visual-service:@wdio/image-comparison-core:options')

const IGNORE_OPTION_KEYS = [
    'ignoreAlpha',
    'ignoreAntialiasing',
    'ignoreColors',
    'ignoreLess',
    'ignoreNothing',
] as const

const {
    ignoreAlpha: _ignoreAlpha,
    ignoreAntialiasing: _ignoreAntialiasing,
    ignoreColors: _ignoreColors,
    ignoreLess: _ignoreLess,
    ignoreNothing: _ignoreNothing,
    ...SHARED_COMPARE_DEFAULTS
} = DEFAULT_COMPARE_OPTIONS

/**
 * Thrown when ignore* preset keys and a non-empty pixelmatch object appear on the same options.
 */
export class CompareOptionsConflictError extends Error {
    constructor(context: string, presentIgnoreKeys: string[]) {
        super(
            'Cannot combine ignore* options with pixelmatch options.\n' +
            `Present ignore keys: ${presentIgnoreKeys.join(', ')} (values are ignored).\n` +
            'Use either ignore* (preset mode) or pixelmatch (direct mode), not both.\n' +
            `Context: ${context}`,
        )
        this.name = 'CompareOptionsConflictError'
    }
}

/**
 * Returns whether the options object contains any ignore* keys (values are ignored).
 */
export function hasIgnoreOptionKeys(options: object): boolean {
    return IGNORE_OPTION_KEYS.some((key) => key in options)
}

/**
 * Returns whether the options object contains a non-empty pixelmatch settings object.
 */
export function hasPixelmatchOptions(options: { pixelmatch?: PixelmatchCompareOptions }): boolean {
    return options.pixelmatch !== undefined && Object.keys(options.pixelmatch).length > 0
}

type CompareMode = 'preset' | 'pixelmatch'

/**
 * Compare options shape used for preset vs pixelmatch mode detection and stripping.
 */
export type CompareModeOptions = Partial<Record<(typeof IGNORE_OPTION_KEYS)[number], unknown>> & {
    pixelmatch?: PixelmatchCompareOptions
}

/**
 * Returns the compare mode implied by an options object.
 */
export function getCompareMode(options: CompareModeOptions): CompareMode {
    return hasPixelmatchOptions(options) ? 'pixelmatch' : 'preset'
}

/**
 * Returns whether method options set compare mode (ignore* or pixelmatch).
 */
export function methodSetsCompareMode(method: CompareModeOptions): boolean {
    return hasPixelmatchOptions(method) || hasIgnoreOptionKeys(method)
}

/**
 * Removes all ignore* keys from a compare options object.
 */
export function stripIgnoreOptionKeys<T extends CompareModeOptions>(options: T): Omit<T, (typeof IGNORE_OPTION_KEYS)[number]> {
    const result = { ...options }

    for (const key of IGNORE_OPTION_KEYS) {
        delete result[key]
    }

    return result
}

/**
 * Removes pixelmatch settings from a compare options object.
 */
export function stripPixelmatchOptions<T extends CompareModeOptions>(options: T): Omit<T, 'pixelmatch'> {
    const { pixelmatch: _pixelmatch, ...rest } = options
    return rest
}

/**
 * Builds a human-readable compare mode label for log output.
 */
function describeCompareMode(options: CompareModeOptions, mode: CompareMode): string {
    if (mode === 'pixelmatch') {
        const threshold = options.pixelmatch?.threshold
        return threshold !== undefined ? `pixelmatch (threshold: ${threshold})` : 'pixelmatch'
    }

    const enabledIgnoreKeys = IGNORE_OPTION_KEYS.filter((key) => key in options)
    return enabledIgnoreKeys.length > 0 ? `preset (${enabledIgnoreKeys.join(', ')})` : 'preset'
}

/**
 * Logs a warning when method options override the service compare mode.
 */
export function warnOnMethodCompareModeOverride(
    wic: CompareModeOptions,
    method: CompareModeOptions,
    commandName: string,
): void {
    const serviceMode = getCompareMode(wic)
    const methodMode = getCompareMode(method)

    log.warn(
        'Method compare options override service compare mode for %s.\n' +
        '  Service: %s\n' +
        '  Method:  %s',
        commandName,
        describeCompareMode(wic, serviceMode),
        describeCompareMode(method, methodMode),
    )
}

/**
 * Merges service and method compare options; method wins and strips the opposing compare mode.
 */
export function resolveEffectiveCompareOptions<W extends object, M extends object>(
    wic: W,
    method: M,
    commandName: string,
): W & M {
    assertExclusiveCompareMode(method as CompareModeOptions, commandName)

    const wicMode = getCompareMode(wic as CompareModeOptions)
    const methodMode = hasPixelmatchOptions(method as CompareModeOptions)
        ? 'pixelmatch'
        : hasIgnoreOptionKeys(method)
            ? 'preset'
            : null
    const merged = { ...wic, ...method } as W & M

    if (methodMode === 'pixelmatch') {
        if (wicMode === 'preset') {
            warnOnMethodCompareModeOverride(wic as CompareModeOptions, method as CompareModeOptions, commandName)
        }

        return {
            ...stripIgnoreOptionKeys(merged as CompareModeOptions),
            pixelmatch: {
                ...(wic as CompareModeOptions).pixelmatch,
                ...(method as CompareModeOptions).pixelmatch,
            },
        } as unknown as W & M
    }

    if (methodMode === 'preset') {
        if (wicMode === 'pixelmatch') {
            warnOnMethodCompareModeOverride(wic as CompareModeOptions, method as CompareModeOptions, commandName)
        }

        return stripPixelmatchOptions(merged as CompareModeOptions) as unknown as W & M
    }

    return merged
}

/**
 * Throws when ignore* keys and pixelmatch options are both present on the same object.
 */
export function assertExclusiveCompareMode(
    options: CompareModeOptions,
    context: string,
): void {
    if (hasIgnoreOptionKeys(options) && hasPixelmatchOptions(options)) {
        const presentIgnoreKeys = IGNORE_OPTION_KEYS.filter((key) => key in options)
        throw new CompareOptionsConflictError(context, presentIgnoreKeys)
    }
}

/**
 * Merges user pixelmatch settings with library defaults for direct comparison mode.
 */
export function resolvePixelmatchOptions(userOptions: PixelmatchCompareOptions): ResolvedPixelmatchOptions {
    return {
        threshold: userOptions.threshold ?? DEFAULT_PIXELMATCH_OPTIONS.threshold,
        includeAA: userOptions.includeAA ?? DEFAULT_PIXELMATCH_OPTIONS.includeAA,
        diffColor: userOptions.diffColor ?? DEFAULT_PIXELMATCH_OPTIONS.diffColor,
        aaColor: userOptions.aaColor ?? DEFAULT_PIXELMATCH_OPTIONS.aaColor,
        diffColorAlt: userOptions.diffColorAlt ?? DEFAULT_PIXELMATCH_OPTIONS.diffColorAlt,
        alpha: userOptions.alpha ?? DEFAULT_PIXELMATCH_OPTIONS.alpha,
        diffMask: userOptions.diffMask ?? DEFAULT_PIXELMATCH_OPTIONS.diffMask,
        checkerboard: userOptions.checkerboard ?? DEFAULT_PIXELMATCH_OPTIONS.checkerboard,
    }
}

/**
 * Builds normalized compare options, branching preset vs direct pixelmatch mode.
 */
function buildCompareOptions(options: ClassOptions): CompareOptions {
    const deprecatedCompareOptions = logAllDeprecatedCompareOptions(options)
    const userCompareOptions = options.compareOptions ?? {}
    const mergedUserCompareOptions = {
        ...deprecatedCompareOptions,
        ...userCompareOptions,
    }

    assertExclusiveCompareMode(mergedUserCompareOptions, 'compareOptions')

    if (hasPixelmatchOptions(mergedUserCompareOptions)) {
        return {
            ...SHARED_COMPARE_DEFAULTS,
            ...mergedUserCompareOptions,
            pixelmatch: mergedUserCompareOptions.pixelmatch,
        } as CompareOptions
    }

    return {
        ...DEFAULT_COMPARE_OPTIONS,
        ...deprecatedCompareOptions,
        ...userCompareOptions,
    } as CompareOptions
}

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
        ignoreRegionPadding: options.ignoreRegionPadding ?? 1,
        waitForFontsLoaded: options.waitForFontsLoaded ?? true,
        alwaysSaveActualImage: options.alwaysSaveActualImage ?? true,

        compareOptions: buildCompareOptions(options),

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
    const compareOptionKeys = [
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
        'pixelmatch',
    ] as const

    return compareOptionKeys.reduce((result, key) => {
        if (key in options && options[key] !== undefined) {
            result[key] = options[key] as never
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
        alwaysSaveActualImage?: boolean
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

    const { formatImageName, savePerInstance, alwaysSaveActualImage } = wicOptions

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
        alwaysSaveActualImage: alwaysSaveActualImage ?? true,
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

/** Resemble last-wins order, must match `prepareIgnoreOptions` filter order. */
export const IGNORE_PRESET_ORDER: ComparisonIgnoreOption[] = ['alpha', 'antialiasing', 'colors', 'less', 'nothing']

const IGNORE_PRESET_OPTION_NAMES: Record<ComparisonIgnoreOption, string> = {
    alpha: 'ignoreAlpha',
    antialiasing: 'ignoreAntialiasing',
    colors: 'ignoreColors',
    less: 'ignoreLess',
    nothing: 'ignoreNothing',
}

const COMPARE_PRESET_SETTINGS: Record<ComparisonIgnoreOption, { threshold: number; includeAA: boolean }> = {
    nothing: { threshold: 0, includeAA: true },
    less: { threshold: 0.063, includeAA: true },
    antialiasing: {
        // Resemble's ignoreAntialiasing uses 32/255 per-channel tolerance (~0.13 YIQ).
        threshold: 0.13,
        includeAA: false,
    },
    alpha: { threshold: 0.063, includeAA: true },
    colors: { threshold: 0.063, includeAA: true },
}

/**
 * Returns the active resemble preset from an ignore list using last-wins semantics.
 */
export function resolveActiveIgnorePreset(ignoreList: ComparisonIgnoreOption[]): ComparisonIgnoreOption | null {
    let activePreset: ComparisonIgnoreOption | null = null

    for (const preset of IGNORE_PRESET_ORDER) {
        if (ignoreList.includes(preset)) {
            activePreset = preset
        }
    }

    return activePreset
}

/**
 * Maps an ignore list to pixelmatch threshold and AA settings via resemble last-wins presets.
 * An empty list yields the strict preset (e.g. `ignoreAntialiasing: false` with no other flags).
 */
export function resolveComparePreset(ignoreList: ComparisonIgnoreOption[]): { threshold: number; includeAA: boolean } {
    const activePreset = resolveActiveIgnorePreset(ignoreList)

    if (activePreset) {
        return COMPARE_PRESET_SETTINGS[activePreset]
    }

    // Default strict tolerance: 16/255 per channel (~6.3% of max YIQ distance).
    return { threshold: 0.063, includeAA: true }
}

export function prepareIgnoreOptions(imageCompareOptions: MethodImageCompareCompareOptions): ComparisonIgnoreOption[] {
    return IGNORE_PRESET_ORDER.filter((option) =>
        Object.keys(imageCompareOptions).find(
            (key: keyof typeof imageCompareOptions) => key.toLowerCase().includes(option) && imageCompareOptions[key],
        ),
    )
}

/**
 * Logs a warning when multiple ignore* flags are enabled. Only the last preset in
 * resemble order is applied for threshold and AA settings.
 */
export function warnOnMultipleIgnorePresets(ignoreList: ComparisonIgnoreOption[]): void {
    if (ignoreList.length < 2) {
        return
    }

    const activePreset = resolveActiveIgnorePreset(ignoreList)
    const enabledOptions = ignoreList.map((preset) => IGNORE_PRESET_OPTION_NAMES[preset]).join(', ')
    const activeOption = activePreset ? IGNORE_PRESET_OPTION_NAMES[activePreset] : 'none'

    log.warn(
        'Multiple ignore* compare options are enabled (%s). Only one preset is applied per comparison.\n' +
        '  Active: %s (last-wins order: ignoreAlpha → ignoreAntialiasing → ignoreColors → ignoreLess → ignoreNothing).',
        enabledOptions,
        activeOption,
    )
}

