import { Folders } from '@wdio/visual-service';
import type { RemoteCapability } from 'node_modules/@wdio/types/build/Capabilities.js'

export interface StorybookRunnerOptions {
    /**
     * If true, the story will be clipped component preventing extraneous whitespace. Enabled by default
     */
    clip?: boolean;
    /**
     * The selector to clip to when clip = true. Defaults to Storybook's V7 root element
     */
    clipSelector?: string;
    /**
     * Specify the number of separate shards to create, default is 1
     */
    numShards?: number
    /**
     * Skip stories that match the given string or regex
     */
    skipStories?: string | string[];
    /**
     * The URL of the storybook, default will be 'http://127.0.0.1:6006'
     */
    url?: string;
    /**
     * Version of the storybook, default is 7
     */
    version?: number
}

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
    clip: boolean;
    clipSelector: string;
    directoryPath: string,
    folders: Folders,
    framework: string,
    numShards:number,
    skipStories: string[] | RegExp,
    storiesJson: StorybookData[],
    storybookUrl: string;
}

export interface CapabilityMap {
    chrome: RemoteCapability;
    firefox: RemoteCapability;
    safari: RemoteCapability;
    edge: RemoteCapability;
}

export type CreateTestContent = {
    clip: boolean;
    clipSelector: string;
    folders: Folders;
    framework: string;
    skipStories: string[] | RegExp;
    stories: StorybookData[];
    storybookUrl: string;
}

export type CreateItContent = {
    clip: boolean;
    clipSelector: string;
    folders: Folders;
    framework: string;
    skipStories: string[] | RegExp;
    storyData: StorybookData;
    storybookUrl: string;
}

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
    clipSelector?: string,
    id: string;
    timeout?: number,
    url?: string;
}
