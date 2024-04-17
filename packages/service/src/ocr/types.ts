/**
 * Class options for OCR
 */
export interface OcrOptions {
    ocr?: {
        /**
         * Adjusts the contrast of the image, value between -1 and 1
         * Default: 0.25
         */
        contrast?: number;
        /**
         * The path to store the images for OCR
         */
        imagesPath?: string;
        /**
         * The language to use for OCR, can be found here:
         * ocr/utils/constants.ts > SUPPORTED_LANGUAGES
         * Default: eng
         */
        language?: string;
    }
}

/**
 * Browser command options
 */
type DefaultCommandOptions = {
    contrast?: number;
    element?: WebdriverIO.Element | ChainablePromiseElement;
    language?: string;
}

export type GetTextOptions = DefaultCommandOptions & {}

export type GetElementPositionByTextOptions = DefaultCommandOptions & {
    fuzzyFindOptions?: FuzzySearchOptions;
    text: string;
}

export type WaitForTextDisplayedOptions = GetElementPositionByTextOptions & {
    timeout?: number;
    timeoutMsg?: string;
}

export type ClickOnTextOptions = GetElementPositionByTextOptions & {
    clickDuration?: Number;
    relativePosition?: RelativePosition;
}

export type SetValueOptions = ClickOnTextOptions & {
    submitValue?: boolean;
    value: string;
}

/**
 * Method options
 */
type DefaultMethodOptions = DefaultCommandOptions & {
    contrast: number;
    isTesseractAvailable: boolean;
    language: string;
    ocrImagesPath: string;
}

export type OcrGetTextOptions = DefaultMethodOptions & {}

export type OcrGetDataOptions = DefaultMethodOptions & {}

export type OcrGetElementPositionByTextOptions = DefaultMethodOptions & {
    fuzzyFindOptions?: FuzzySearchOptions;
    relativePosition?: RelativePosition;
    text: string;
}

export type OcrWaitForTextDisplayedOptions = OcrGetElementPositionByTextOptions & {
    timeout?: number;
    timeoutMsg?: string;
}

export type OcrClickOnTextOptions = OcrGetElementPositionByTextOptions & {
    clickDuration?: Number;
}

export type OcrSetValueOptions = OcrClickOnTextOptions & {
    submitValue?: boolean;
    value: string;
}

/**
 * Internal Methods
 */
export type GetOcrData = {
    text: string;
    lines: Line[];
    words: Words[];
}

/**
 * Internal types
 */
export type Line = {
    text: string;
    bbox: Rectangles;
}

export type Rectangles = {
    left: number;
    right: number;
    top: number;
    bottom: number;
}

export type Words = Line & {
    wc: number;
}

export type TessaractDataOptions = {
    filePath: string;
    language: string;
}

export type ParseWordData = {
    bbox: Rectangles;
    wc: number
}

export type OcrGetTextPositionsOptions = DefaultMethodOptions & {}

export type OcrGetTextPositions = {
    dprPosition: Rectangles;
    filePath: string;
    originalPosition: Rectangles;
    text: string;
}

export type FuzzyFindOptions = {
    pattern: string;
    searchOptions?: FuzzySearchOptions;
    textArray: {
      /**
       * the matched string
       */
      text: string;
      /**
       * The original position
       */
      originalPosition: Rectangles;
      /**
       * The position after DPR check
       * screenshots for iOS are with DPR
       * position on the screen for iOS is smaller
       */
      dprPosition: Rectangles;
    }[];
}

export type FuzzySearchOptions = {
    /**
     * Determines how close the match must be to the fuzzy location (specified by location). An exact letter match
     * which is distance characters away from the fuzzy location would score as a complete mismatch. A distance of
     * 0 requires the match be at the exact location specified. A distance of 1000 would require a perfect match to
     * be within 800 characters of the location to be found using a threshold of 0.8.
     * Default: 100
     */
    distance?: number;
    /**
     * Whether the search should be case sensitive
     * Default: false
     */
    isCaseSensitive?: boolean;
    /**
     * Only the matches whose length exceeds this value will be returned.
     * (For instance, if you want to ignore single character matches in the result, set it to 2)
     * Default: 2
     */
    minMatchCharLength?: number;
    /**
     * When true, the matching function will continue to the end of a search pattern even if a perfect match has
     * already been located in the string.
     * Default: false
     */
    findAllMatches?: boolean;
    /**
     * Determines approximately where in the text is the pattern expected to be found
     * Default: 0
     */
    location?: number;
    /**
     * At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters
     * and location), a threshold of 1.0 would match anything.
     * Default: 0.6
     */
    threshold?: number;
}

export type FuzzyElement = {
    /**
     * The found item
     */
    item: {
        /**
         * The position after DPR check
         * screenshots for iOS are with DPR
         * position on the screen for iOS is smaller
         */
        dprPosition: Rectangles;
        /**
         * The path of the OCR screenshot
         */
        filePath: string;
        /**
         * The original position
         */
        originalPosition: Rectangles;
        /**
         * the matched string
         */
        text: string;
    };
    /**
     * Index of the fuzzy logic check
     */
    refIndex: number;
    /**
     * Matched score of the fuzzy logic check
     */
    score: number;
}

export type DetermineClickPointOptions = {
    rectangles: Rectangles;
}

export type ClickPoint = {
    x: number;
    y: number;
}

export type RectReturn = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type RelativePosition =  {
    above?: number;
    below?: number;
    left?: number;
    right?: number;
}

export type ProcessImageOptions = {
    contrast: number;
    elementRectangles?: RectReturn;
    isAndroid: boolean;
    isIOS: boolean;
    ocrImagesPath: string;
    screenshot: string;
}

export type ProcessImage = {
    filePath: string;
}

export type DrawHighlightedWords = {
    filePath: string;
    highlights: Rectangles[];
}

/**
 * xml2js System Tessaract Types
 */
export type UnprocessedSystemBlock = {
    TextBlock?: UnprocessedSystemTextBlockElement[];
}

export type UnprocessedSystemTextBlockElement = {
    TextLine: UnprocessedSystemTextLineElement[];
}

export type UnprocessedSystemTextLineElement = {
    $: {
        HPOS: string;
        VPOS: string;
        WIDTH: string;
        HEIGHT: string;
    };
    String: UnprocessedSystemStringElement[];
}

export type UnprocessedSystemStringElement = {
    $: {
        CONTENT: string;
        HPOS: string;
        VPOS: string;
        WIDTH: string;
        HEIGHT: string;
        WC: string;
    };
}

export type TargetOptions = {
    filePath: string;
    targetX: number;
    targetY: number;
}

/**
 * xml2js Nodejs Tessaract Types
 */
export type UnprocessedNodejsBlock = {
     p?: UnprocessedNodejsParagraph[];
}

export type UnprocessedNodejsParagraph = {
    span?: UnprocessedNodejsLine[];
}

export type UnprocessedNodejsLine ={
    span?: UnprocessedNodejsWord[];
}

export type UnprocessedNodejsWord = {
    _: string;
    $: {
        title: string;
    };
}

/**
 * Browser command return types
 */
export interface OcrGetData extends GetOcrData {
    dpr: number;
    filePath: string;
}

export type OcrGetElementPositionByText = {
    /**
     * The position after DPR check
     * screenshots for iOS are with DPR
     * position on the screen for iOS is smaller
     */
    dprPosition: Rectangles,
    /**
     * The path of the OCR screenshot
     */
    filePath: string;
    /**
     * the matched string
     */
    matchedString: string;
    /**
     * The original position
     */
    originalPosition: Rectangles,
    /**
     * the original search value
     */
    searchValue: string;
    /**
     * Matched score of the fuzzy logic check
     */
    score: number;
}
