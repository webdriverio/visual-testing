export interface Rectangles {
    left: number;
    right: number;
    top: number;
    bottom: number;
  }

export interface ClickPoint {
    x: number;
    y: number;
  }

export interface DetermineClickPointOptions {
    rectangles: Rectangles;
  }

export interface OcrServiceConfig {
    ocrImagesPath?: string;
    ocrLanguage?: string;
  }

export interface WaitForTextDisplayedOptions {
    element?: WebdriverIO.Element|ChainablePromiseElement;
    timeout?: number;
    timeoutMsg?: string;
  }

export interface SetValueOptions {
    element?: WebdriverIO.Element|ChainablePromiseElement;
    clickDuration?: Number;
  }

export interface ClickOnTextOptions {
    clickDuration?: Number;
    element?: WebdriverIO.Element | ChainablePromiseElement;
    text: string;
}

export interface GetTextOptions {
    element?: WebdriverIO.Element|ChainablePromiseElement;
  }

export interface ElementPositionByText {
    element?: WebdriverIO.Element|ChainablePromiseElement;
  }

export interface Line {
    text: string;
    bbox: Rectangles;
  }

export interface Words {
    text: string;
    bbox: Rectangles;
    wc: number;
  }

export interface GetOcrData {
    text: string;
    lines: Line[];
    words: Words[];
  }

export interface OcrGetDataOptions {
    element?: WebdriverIO.Element | ChainablePromiseElement;
    isTesseractAvailable: boolean;
    language: string;
    ocrImagesPath: string;
}

export type GetElementPositionByTextOptions ={
    element?: WebdriverIO.Element | ChainablePromiseElement;
    text: string;
}

export type OcrGetElementPositionByTextOptions ={
    element?: WebdriverIO.Element | ChainablePromiseElement;
    isTesseractAvailable: boolean;
    language: string;
    ocrImagesPath: string;
    reuseOcr: boolean;
    screenSize: ScreenSize;
    text: string;
}

export type OcrGetTextPositionsOptions = {
    element?: WebdriverIO.Element | ChainablePromiseElement;
    isTesseractAvailable: boolean;
    language: string;
    ocrImagesPath: string;
    reuseOcr: boolean;
    screenSize: ScreenSize;
}

export type OcrGetTextPositions ={
  dprPosition: Rectangles;
  originalPosition: Rectangles;
  text: string;
}

export interface OcrGetData extends GetOcrData {
    dpr: number;
}

export type OcrClickOnTextOptions ={
    isTesseractAvailable: boolean;
    language: string;
    ocrImagesPath: string;
    reuseOcr: boolean;
    screenSize: ScreenSize;
    text: string;
    clickDuration?: Number;
}

export type UnprocessedWord = {
    _: string;
    $: {
        title: string;
    };
}

export type UnprocessedLine ={
    span?: UnprocessedWord[];
}

export type GetOcrDataOptions = {
    filePath: string;
    language: string;
}

export type UnprocessedParagraph = {
    span?: UnprocessedLine[];
}
export type UnprocessedBlock = {
     p?: UnprocessedParagraph[];
}

export type LineData = {
    text: string;
    bbox: Rectangles;
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

export type UnprocessedSystemTextLineElement = {
    $: {
        HPOS: string;
        VPOS: string;
        WIDTH: string;
        HEIGHT: string;
    };
    String: UnprocessedSystemStringElement[];
}

export type UnprocessedSystemTextBlockElement = {
    TextLine: UnprocessedSystemTextLineElement[];
}

export type UnprocessedSystemBlock = {
    TextBlock?: UnprocessedSystemTextBlockElement[];
}

export type RectReturn = {
    x: number;
    y: number;
    width: number;
    height: number;
}

export type FuzzyFindOptions = {
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
    pattern: string;
    searchOptions?: {
      isCaseSensitive?: boolean;
      /**
       * Only the matches whose length exceeds this value will be returned.
       * (For instance, if you want to ignore single character matches in the result, set it to 2)
       */
      minMatchCharLength?: number;
      /**
       * When true, the matching function will continue to the end of a search pattern even if a perfect match has
       * already been located in the string.
       */
      findAllMatches?: boolean;
      /**
       * Determines approximately where in the text is the pattern expected to be found
       */
      location?: number;
      /**
       * At what point does the match algorithm give up. A threshold of 0.0 requires a perfect match (of both letters
       * and location), a threshold of 1.0 would match anything.
       */
      threshold?: number;
      /**
       * Determines how close the match must be to the fuzzy location (specified by location). An exact letter match
       * which is distance characters away from the fuzzy location would score as a complete mismatch. A distance of
       * 0 requires the match be at the exact location specified. A distance of 1000 would require a perfect match to
       * be within 800 characters of the location to be found using a threshold of 0.8.
       */
      distance?: number;
    };
}
export type ScreenSize = {
    width: number;
    height: number;
}

export type FuzzyElement = {
    /**
     * The found item
     */
    item: {
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

export type OcrGetElementPositionByText = {
    /**
     * the original search value
     */
    searchValue: string;
    /**
     * the matched string
     */
    matchedString: string;
    /**
     * The original position
     */
    originalPosition: Rectangles,
    /**
     * The position after DPR check
     * screenshots for iOS are with DPR
     * position on the screen for iOS is smaller
     */
    dprPosition: Rectangles,
    /**
     * Matched score of the fuzzy logic check
     */
    score: number;
  }
