import type { TabbableOptions } from '../commands/tabbable.interfaces.js'

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
     * Create fullpage screenshots with the BiDi protocol.
     */
    createBidiFullPageScreenshots?: boolean;

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
     * Ignore alpha channel when comparing images.
     */
    ignoreAlpha?: boolean;

    /**
     * Ignore anti-aliasing when comparing images.
     */
    ignoreAntialiasing?: boolean;

    /**
     * Compare two images in black and white only.
     */
    ignoreColors?: boolean;

    /**
     * Compare images with reduced sensitivity.
     * red = 16, green = 16, blue = 16, alpha = 16, minBrightness = 16, maxBrightness = 240
     */
    ignoreLess?: boolean;

    /**
     * Compare images with full sensitivity.
     * red = 0, green = 0, blue = 0, alpha = 0, minBrightness = 0, maxBrightness = 255
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
     * Enable full-page screenshots via the WebDriver BiDi protocol.
     */
    createBidiFullPageScreenshots: boolean;

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
}

export interface CompareOptions {
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
     * Compare images and discard the alpha channel.
     */
    ignoreAlpha: boolean;

    /**
     * Compare images and ignore anti-aliasing effects.
     */
    ignoreAntialiasing: boolean;

    /**
     * Compare two black-and-white versions of the images, ignoring colors.
     */
    ignoreColors: boolean;

    /**
     * Use a less sensitive comparison setting:
     * red = 16, green = 16, blue = 16, alpha = 16, minBrightness = 16, maxBrightness = 240
     */
    ignoreLess: boolean;

    /**
     * Use the most sensitive comparison setting:
     * red = 0, green = 0, blue = 0, alpha = 0, minBrightness = 0, maxBrightness = 255
     */
    ignoreNothing: boolean;

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
     */
    saveAboveTolerance: number;

    /**
     * Scale images to the same size before comparing them.
     */
    scaleImagesToSameSize: boolean;
}

