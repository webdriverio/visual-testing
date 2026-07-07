import type { TabbableOptions } from '../commands/tabbable.interfaces.js'
import type { PixelmatchCompareOptions } from '../pixelmatch/compare.interfaces.js'

export interface ClassOptions {
    // ==================
    // Class options
    // ==================

    /**
     * The padding added to the address bar on iOS and Android
     * to properly cut out the viewport.
     */
    addressBarShadowPadding?: number;

    /**
     * Automatically scroll to an element before taking a screenshot.
     */
    autoElementScroll?: boolean;

    /**
     * Add iOS bezel corners and notch/dynamic island to the screenshot.
     */
    addIOSBezelCorners?: boolean;

    /**
     * Delete runtime folder (actual & diff) on initialization.
     */
    clearRuntimeFolder?: boolean;

    /**
     * Use user based fullpage screenshots, by default the desktop screenshots are taken with the BiDi protocol.
     */
    userBasedFullPageScreenshot?: boolean;

    /**
     * By default the screenshots are taken with the BiDi protocol if Bidi is available.
     * If you want to use the legacy method, set this to true.
     */
    enableLegacyScreenshotMethod?: boolean;

    /**
     * Customize the naming of saved images using a format string.
     */
    formatImageName?: string;

    /**
     * Indicates if this is a hybrid app.
     */
    isHybridApp?: boolean;

    /**
     * Save the images per instance in a separate folder.
     */
    savePerInstance?: boolean;

    /**
     * The padding added to the toolbar on iOS and Android
     * to properly cut out the viewport.
     */
    toolBarShadowPadding?: number;

    /**
     * Wait for fonts to be fully loaded before taking a screenshot.
     */
    waitForFontsLoaded?: boolean;

    /**
     * Always save the actual image to disk, even when comparison passes.
     * When false, the actual image is only saved when comparison fails (mismatch > 0 or > threshold).
     * @default true
     */
    alwaysSaveActualImage?: boolean;

    // ==================
    // Baseline options
    // ==================

    /**
     * If no baseline image is found during comparison, automatically save the image to the baseline folder.
     */
    autoSaveBaseline?: boolean;

    /**
     * Directory where all actual and diff screenshots will be stored.
     */
    screenshotPath?: string | ((options: ClassOptions) => string);

    /**
     * Directory for storing baseline images used during comparison.
     */
    baselineFolder?: string | ((options: ClassOptions) => string);

    // ==========================
    // Class and method options
    // ==========================

    /**
     * Disable the blinking cursor in screenshots.
     */
    disableBlinkingCursor?: boolean;

    /**
     * Enable or disable all CSS animations and input carets.
     */
    disableCSSAnimation?: boolean;

    /**
     * Make all text transparent to focus only on layout.
     */
    enableLayoutTesting?: boolean;

    /**
     * Time (ms) to wait after a scroll; useful for lazy loading content.
     */
    fullPageScrollTimeout?: number;

    /**
     * Hide scrollbars in the screenshots.
     */
    hideScrollBars?: boolean;

    /**
     * Padding in device pixels added to each side of element ignore regions (default 1).
     * Set to 0 to disable. Only applies to element screenshots.
     */
    ignoreRegionPadding?: number;

    // ================
    // Compare options
    // ================

    /**
     * @deprecated Use `compareOptions` instead.
     * Automatically block out the side bar for iPads in landscape mode during comparisons.
     * Prevents failures on the tab/private/bookmark native component.
     */
    blockOutSideBar?: boolean;

    /**
     * Automatically block out the status and address bar during comparisons (mobile only).
     * Prevents failures due to dynamic UI elements like time, Wi-Fi, battery, etc.
     */
    blockOutStatusBar?: boolean;

    /**
     * Automatically block out the tool bar during comparisons (mobile only).
     */
    blockOutToolBar?: boolean;

    /**
     * Generate JSON report files with comparison data (useful for custom HTML reports).
     */
    createJsonReportFiles?: boolean;

    /**
     * Pixel proximity used to group diff pixels in JSON reports.
     *
     * @default 5
     */
    diffPixelBoundingBoxProximity?: number;

    /**
     * Ignore alpha-channel differences during comparison.
     * Preprocessing sets all alpha values to opaque before pixelmatch runs.
     * Preset: strict threshold (~16/255), AA not forgiven.
     */
    ignoreAlpha?: boolean;

    /**
     * Forgive anti-aliased pixels during comparison (pixelmatch `includeAA: false`).
     * Preset: relaxed threshold (~32/255), AA forgiven.
     * When combined with other ignore flags, last-wins order applies
     * (`alpha` → `antialiasing` → `colors` → `less` → `nothing`).
     * Defaults to `true` so sub-pixel rendering noise is ignored out of the box.
     * Set to `false` for strict comparison where AA pixels count as mismatches.
     */
    ignoreAntialiasing?: boolean;

    /**
     * Compare brightness only, ignoring hue differences.
     * Preprocessing converts both images to grayscale using resemble luma (`0.3/0.59/0.11`).
     * Preset: strict threshold (~16/255), AA not forgiven.
     */
    ignoreColors?: boolean;

    /**
     * Use a relaxed RGB tolerance (~16/255 per channel in YIQ space).
     * Preset: strict threshold, AA not forgiven (does not inherit default AA forgiveness).
     */
    ignoreLess?: boolean;

    /**
     * Use zero tolerance: any pixel difference counts as a mismatch.
     * Preset: threshold `0`, AA not forgiven.
     */
    ignoreNothing?: boolean;

    /**
     * Return raw mismatch percentage (e.g., `0.12345678`) instead of rounded (e.g., `0.12`).
     */
    rawMisMatchPercentage?: boolean;

    /**
     * Return all compare data, not just mismatch percentage.
     */
    returnAllCompareData?: boolean;

    /**
     * Threshold mismatch percentage above which diff image will be saved.
     */
    saveAboveTolerance?: number;

    /**
     * Scale images to same dimensions before comparison.
     */
    scaleImagesToSameSize?: boolean;

    /**
     * Options object passed to the underlying image comparison engine.
     * Use either `ignore*` preset flags or a `pixelmatch` object, not both.
     */
    compareOptions?: Partial<CompareOptions>;

    // ==================
    // Tabbable options
    // ==================

    /**
     * Configuration for tabbable elements highlighting.
     */
    tabbableOptions?: TabbableOptions;

    /**
     * Storybook-specific visual testing options.
     */
    storybook?: {
        /**
         * If true, clips the story component to remove extra whitespace.
         *
         * @default true
         */
        clip?: boolean;

        /**
         * Selector to use when `clip = true`. Defaults to Storybook's root element.
         */
        clipSelector?: string;

        /**
         * Number of shards to divide tests across.
         *
         * @default 1
         */
        numShards?: number;

        /**
         * Stories to skip, by string or RegExp.
         */
        skipStories?: string | string[];

        /**
         * Storybook server URL.
         *
         * @default 'http://127.0.0.1:6006'
         */
        url?: string;

        /**
         * Version of Storybook in use.
         *
         * @default 7
         */
        version?: number;

        /**
         * Additional search parameters for the Storybook URL.
         *
         * @example new URLSearchParams({ 'foo': 'bar' })
         * Results in URL like: `http://storybook.url/iframe.html?id=story-id&foo=bar`
         */
        additionalSearchParams?: URLSearchParams;

        /**
         * Path builder for saving story baselines.
         *
         * @param category The component category (e.g. "forms").
         * @param component The component name (e.g. "input").
         * @returns Path to store baselines under the `baselineFolder`.
         *
         * @example
         * ```ts
         * (category, component) => `${category}__${component}`
         * ```
         *
         * @default
         * ```ts
         * (category, component) => `./${category}/${component}/`
         * ```
         */
        getStoriesBaselinePath?: (category: string, component: string) => string;
    }
}

export interface DefaultOptions {
    /**
     * Padding added to the address bar (iOS/Android) to properly cut out the viewport.
     */
    addressBarShadowPadding: number;

    /**
     * Automatically scroll to an element before capturing a screenshot.
     */
    autoElementScroll: boolean;

    /**
     * Adds iOS bezel corners and notch/dynamic island to the screenshot.
     */
    addIOSBezelCorners: boolean;

    /**
     * Automatically saves the image as a baseline if none is found during comparison.
     */
    autoSaveBaseline: boolean;

    /**
     * Delete the runtime folder (`actual` and `diff`) on initialization.
     */
    clearFolder: boolean;

    /**
     * Options used for image comparison.
     */
    compareOptions: CompareOptions;

    /**
     * Use user based fullpage screenshots, by default the desktop screenshots are taken with the BiDi protocol.
     */
    userBasedFullPageScreenshot: boolean;

    /**
     * By default the screenshots are taken with the BiDi protocol if Bidi is available.
     * If you want to use the legacy method, set this to true.
     */
    enableLegacyScreenshotMethod: boolean;

    /**
     * Disable the blinking cursor in the screenshot.
     */
    disableBlinkingCursor: boolean;

    /**
     * Disable all CSS animations and input caret.
     */
    disableCSSAnimation: boolean;

    /**
     * Make all text transparent to focus only on layout during comparison.
     */
    enableLayoutTesting: boolean;

    /**
     * A format string for customizing image file names.
     */
    formatImageName: string;

    /**
     * Timeout in milliseconds to wait after scrolling, useful for lazy-loaded pages.
     */
    fullPageScrollTimeout: number;

    /**
     * Hide scrollbars in the screenshot.
     */
    hideScrollBars: boolean;

    /**
     * Padding in device pixels added to each side of element ignore regions (default 1).
     * Set to 0 to disable. Only applies to element screenshots.
     */
    ignoreRegionPadding?: number;

    /**
     * Indicates whether the app is a hybrid (native + webview).
     */
    isHybridApp: boolean;

    /**
     * Save screenshots per instance in separate folders.
     */
    savePerInstance: boolean;

    /**
     * Options for visualizing tabbable elements.
     */
    tabbableOptions: TabbableOptions;

    /**
     * Padding added to the toolbar (iOS/Android) to properly cut out the viewport.
     */
    toolBarShadowPadding: number;

    /**
     * Wait for fonts to be fully loaded before taking a screenshot.
     */
    waitForFontsLoaded: boolean;

    /**
     * Always save the actual image to disk, even when comparison passes.
     * When false, the actual image is only saved when comparison fails (mismatch > 0 or > threshold).
     */
    alwaysSaveActualImage: boolean;
}

export interface SharedServiceCompareOptions {
    /**
     * Automatically block out the side bar for iPads in landscape mode during comparisons.
     * Prevents failures caused by the tab/private/bookmark native component.
     */
    blockOutSideBar: boolean;

    /**
     * Automatically block out the status and address bar during comparisons.
     * This is mobile only and helps avoid failures caused by dynamic content like time, Wi-Fi, or battery status.
     */
    blockOutStatusBar: boolean;

    /**
     * Automatically block out the tool bar during comparisons.
     * This is mobile only.
     */
    blockOutToolBar: boolean;

    /**
     * Create JSON report files with all comparison data.
     * This can be used to generate custom (HTML) reports.
     */
    createJsonReportFiles: boolean;

    /**
     * Proximity of diff pixels used to group them in the JSON report.
     *
     * The higher the value, the more pixels will be grouped together. Lower values improve accuracy.
     *
     * @default 5
     */
    diffPixelBoundingBoxProximity: number;

    /**
     * Return the raw mismatch percentage as a decimal (e.g., `0.12345678`), instead of a rounded value (e.g., `0.12`).
     */
    rawMisMatchPercentage: boolean;

    /**
     * Return all comparison data, not just the mismatch percentage.
     */
    returnAllCompareData: boolean;

    /**
     * Mismatch percentage threshold above which the image with differences will be saved.
     * When undefined, actual images won't be saved (respects alwaysSaveActualImage: false).
     * Matchers set this value internally based on the expected threshold.
     */
    saveAboveTolerance?: number;

    /**
     * Scale images to the same size before comparing them.
     */
    scaleImagesToSameSize: boolean;
}

/**
 * ignore* preset mode. Maps to resemble-style presets.
 * Cannot be combined with `pixelmatch` on the same options object.
 */
export interface IgnorePresetCompareOptions {
    /**
     * Ignore alpha-channel differences during comparison.
     * Preprocessing sets all alpha values to opaque before pixelmatch runs.
     * Preset: strict threshold (~16/255), AA not forgiven.
     */
    ignoreAlpha: boolean;

    /**
     * Forgive anti-aliased pixels during comparison (pixelmatch `includeAA: false`).
     * Preset: relaxed threshold (~32/255), AA forgiven.
     * When combined with other ignore flags, last-wins order applies
     * (`alpha` → `antialiasing` → `colors` → `less` → `nothing`).
     */
    ignoreAntialiasing: boolean;

    /**
     * Compare brightness only, ignoring hue differences.
     * Preprocessing converts both images to grayscale using resemble luma (`0.3/0.59/0.11`).
     * Preset: strict threshold (~16/255), AA not forgiven.
     */
    ignoreColors: boolean;

    /**
     * Use a relaxed RGB tolerance (~16/255 per channel in YIQ space).
     * Preset: strict threshold, AA not forgiven (does not inherit default AA forgiveness).
     */
    ignoreLess: boolean;

    /**
     * Use zero tolerance: any pixel difference counts as a mismatch.
     * Preset: threshold `0`, AA not forgiven.
     */
    ignoreNothing: boolean;

    /** @deprecated Use preset mode without `pixelmatch`, or direct mode with `pixelmatch` only. */
    pixelmatch?: never;
}

/**
 * Direct pixelmatch mode: full control over threshold, AA, and diff colours.
 * Omit all `ignore*` keys; cannot be combined with preset mode on the same options object.
 */
export interface PixelmatchModeCompareOptions {
    /**
     * Direct pixelmatch comparison settings.
     * Mutually exclusive with all `ignore*` options.
     */
    pixelmatch: PixelmatchCompareOptions;
}

/** Preset or direct pixelmatch compare mode, mutually exclusive per options object. */
export type ExclusiveCompareOptions = IgnorePresetCompareOptions | PixelmatchModeCompareOptions

/** Service compare options: shared fields plus either preset or direct pixelmatch mode. */
export type CompareOptions = SharedServiceCompareOptions & ExclusiveCompareOptions

