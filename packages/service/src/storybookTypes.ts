import type { Logger } from '@wdio/logger'
import type { RemoteCapability } from 'node_modules/@wdio/types/build/Capabilities.js'

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
    numShards:number,
    log: Logger,
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
    stories: StorybookData[];
    storybookUrl: string;
}
