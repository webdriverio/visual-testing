import type { CheckElementMethodOptions, ClassOptions, Folders } from 'webdriver-image-comparison'

export interface StorybookData {
    id: string;
    title: string;
    name: string;
    importPath: string;
    tags: string[];
    storiesImports?: string[];
    type?: 'docs' | 'story';
    kind?: string;
    story?: string;
    parameters?: {
        __id: string;
        docsOnly: boolean;
        fileName: string;
    };
}

export interface IndexRes {
    v: number;
    entries: { [key: string]: StorybookData };
}

export interface StoriesRes {
    v: number;
    stories: { [key: string]: StorybookData };
}

export type Stories = { [key: string]: StorybookData };

export type CreateTestFileOptions = {
    additionalSearchParams: URLSearchParams;
    clip: boolean;
    compareOptions: CheckElementMethodOptions,
    clipSelector: string;
    directoryPath: string,
    folders: Folders,
    framework: string,
    numShards:number,
    skipStories: string[] | RegExp,
    storiesJson: StorybookData[],
    storybookUrl: string;
} & Pick<CreateTestContent, 'getStoriesBaselinePath'>

export interface CapabilityMap {
    chrome: WebdriverIO.Capabilities;
    firefox: WebdriverIO.Capabilities;
    safari: WebdriverIO.Capabilities;
    edge: WebdriverIO.Capabilities;
}

export type CreateTestContent = {
    additionalSearchParams: URLSearchParams;
    clip: boolean;
    clipSelector: string;
    compareOptions: CheckElementMethodOptions,
    folders: Folders;
    framework: string;
    skipStories: string[] | RegExp;
    stories: StorybookData[];
    storybookUrl: string;
} & Pick<CreateItContent, 'getStoriesBaselinePath'>

export type CreateItContent = {
    additionalSearchParams: URLSearchParams;
    clip: boolean;
    clipSelector: string;
    compareOptions: CheckElementMethodOptions,
    folders: Folders;
    framework: string;
    skipStories: string[] | RegExp;
    storyData: StorybookData;
    storybookUrl: string;
} & Pick<NonNullable<ClassOptions['storybook']>, 'getStoriesBaselinePath'>

export type CategoryComponent = { category: string, component: string }

export type ScanStorybookReturnData = { storiesJson: StorybookData[]; storybookUrl: string; tempDir: string}

export type EmulatedDeviceType = {
    name: string,
    screen: {
        dpr: number,
        width: number,
        height: number
    },
    userAgent: string
}

export type WaitForStorybookComponentToBeLoaded = {
    /**
     * Additional search parameters to be added to the Storybook URL
     *
     * @example addtionalSearchParams: new URLSearchParams({ foo: 'bar', abc: 'def' })
     * This will generate the following Storybook URL for stories test: `http://storybook.url/iframe.html?id=story-id&foo=bar&abc=def`
     */
    additionalSearchParams?: URLSearchParams;
    clipSelector?: string,
    id: string;
    timeout?: number,
    url?: string;
}
