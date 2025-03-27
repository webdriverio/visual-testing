import type { TabbableOptions } from '../commands/tabbable.interfaces.js'

export interface ClassOptions {
    /**
     * Class options
     */
    // The padding that needs to be added to the address bar on iOS and Android to do a proper cutout of the the viewport.
    addressBarShadowPadding?: number;
    // Automatically scroll to an element before taking a screenshot.
    autoElementScroll?: boolean;
    // Add iOS bezel corners and notch/dynamic island to the screenshot
    addIOSBezelCorners?: boolean;
    // Delete runtime folder (actual & diff) on initialization
    clearRuntimeFolder?: boolean;
    // The naming of the saved images can be customized by passing the parameter `formatImageName` with a format string
    formatImageName?: string;
    // Is it an hybrid app or not
    isHybridApp?: boolean;
    // Save the images per instance in a separate folder.
    savePerInstance?: boolean;
    // The padding that needs to be added to the toolbar bar on iOS and Android to do a proper cutout of the the viewport.
    toolBarShadowPadding?: number;
    // Wait for the fonts to be loaded before taking a screenshot
    waitForFontsLoaded?: boolean;

    /**
     * Baseline options
     */
    // If no baseline image is found during the comparison the image is automatically copied to the baseline folder when this is set to `true`
    autoSaveBaseline?: boolean;
    // The directory that will hold all the actual / difference screenshots
    screenshotPath?: string | ((options: ClassOptions) => string);
    // The directory that will hold all the baseline images that are used to during the comparison
    baselineFolder?: string | ((options: ClassOptions) => string);

    /**
     * Class and method options
     */
    // Disable the blinking cursor in the screenshots
    disableBlinkingCursor?: boolean;
    // En/Disable all css animations and the input caret in the application.
    disableCSSAnimation?: boolean;
    // Make all text on a page transparent to only focus on the layout.
    enableLayoutTesting?: boolean;
    // The timeout in milliseconds to wait after a scroll. This might help identifying pages with lazy loading.
    fullPageScrollTimeout?: number;
    // Hide scrollbars
    hideScrollBars?: boolean;

    /**
     * Compare options
     */
    // Automatically block out the side bar for iPads in landscape mode during comparisons. This prevents failures on the tab/private/bookmark native component.
    blockOutSideBar?: boolean;
    // Automatically block out the status and address bar during comparisons. This prevents failures on time, wifi or battery status.
    // This is mobile only.
    blockOutStatusBar?: boolean;
    // Automatically block out the tool bar. This is mobile only.
    blockOutToolBar?: boolean;
    // Create JSON report files with all comparison data, this can be used to create a custom (HTML) report.
    createJsonReportFiles?: boolean;
    // The proximity of the diff pixels to determine if a diff pixel is part of a group that is used for the JSON report files.
    // The higher the number the more pixels will be grouped, the lower the number the less pixels will be grouped due to accuracy.
    // Default is 5 pixels
    diffPixelBoundingBoxProximity?: number;
    // Compare images and discard alpha.
    ignoreAlpha?: boolean;
    // Compare images and discard anti aliasing.
    ignoreAntialiasing?: boolean;
    // Even though the images are in colour, the comparison wil compare 2 black/white images
    ignoreColors?: boolean;
    // Compare images and compare with `red = 16, green = 16, blue = 16, alpha = 16, minBrightness=16, maxBrightness=240`
    ignoreLess?: boolean;
    // Compare images and compare with `red = 0, green = 0, blue = 0, alpha = 0, minBrightness=0, maxBrightness=255`
    ignoreNothing?: boolean;
    // If true the return percentage will be like `0.12345678`, default is `0.12`
    rawMisMatchPercentage?: boolean;
    // This will return all compare data, not only the mismatch percentage
    returnAllCompareData?: boolean;
    // Allowable value of misMatchPercentage that prevents saving image with differences
    saveAboveTolerance?: number;
    //Scale images to same size before comparison
    scaleImagesToSameSize?: boolean;

    /**
     * Tabbable options
     */
    tabbableOptions?: TabbableOptions;

    /**
     * Storybook options
     */
    storybook?:{
        // If true, the story will be clipped component preventing extraneous whitespace. Enabled by default
        clip?: boolean;
        // The selector to clip to when clip = true. Defaults to Storybook's V7 root element
        clipSelector?: string;
        // Specify the number of separate shards to create, default is 1
        numShards?: number
        // Skip stories that match the given string or regex
        skipStories?: string | string[];
        // The URL of the storybook, default will be 'http://127.0.0.1:6006'
        url?: string;
        // Version of the storybook, default is 7
        version?: number
        /**
         * Additional search parameters to be added to the Storybook URL
         *
         * @example { additionalSearchParams: new URLSearchParams({ 'foo': 'bar' }) }
         * This will generate the following Storybook URL for stories test: `http://storybook.url/iframe.html?id=story-id&foo=bar`
         *
         */
        additionalSearchParams?: URLSearchParams;
        /**
         * Path builder for the story baseline
         *
         * @param category The component category (e.g. "forms" when the story is "Forms/Input")
         * @param component The component name (e.g. "input" when the story is "Forms/Input")
         * @returns The path where the baseline will be saved, under the `baselineFolder` folder.
         *
         * @example (category, component) => `${category}__${component}`
         * @default (category, component) => `./${category}/${component}/`
         */
        getStoriesBaselinePath?: (category: string, component: string) => string;
    }
}

export interface DefaultOptions {
    addressBarShadowPadding: number;
    autoElementScroll: boolean;
    addIOSBezelCorners: boolean;
    autoSaveBaseline: boolean;
    clearFolder: boolean;
    compareOptions: CompareOptions;
    disableBlinkingCursor: boolean;
    disableCSSAnimation: boolean;
    enableLayoutTesting: boolean;
    formatImageName: string;
    fullPageScrollTimeout: number;
    hideScrollBars: boolean;
    isHybridApp: boolean;
    savePerInstance: boolean;
    tabbableOptions: TabbableOptions;
    toolBarShadowPadding: number;
    waitForFontsLoaded: boolean;
}

interface CompareOptions {
    blockOutSideBar: boolean;
    blockOutStatusBar: boolean;
    blockOutToolBar: boolean;
    createJsonReportFiles: boolean;
    diffPixelBoundingBoxProximity: number;
    ignoreAlpha: boolean;
    ignoreAntialiasing: boolean;
    ignoreColors: boolean;
    ignoreLess: boolean;
    ignoreNothing: boolean;
    rawMisMatchPercentage: boolean;
    returnAllCompareData: boolean;
    saveAboveTolerance: number;
    scaleImagesToSameSize: boolean;
}
