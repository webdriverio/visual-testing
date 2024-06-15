import type { RemoteCapability } from 'node_modules/@wdio/types/build/Capabilities.js'
import type { Folders } from 'webdriver-image-comparison'

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
    storiesJson: Stories,
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

export type ScanStorybookReturnData = { storiesJson: Stories; storybookUrl: string; tempDir: string}

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
    storybookUrl?: string;
    timeout?: number,
}
