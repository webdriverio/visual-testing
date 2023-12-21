import type { Capabilities } from '@wdio/types'

type DeviceOrientation = 'LANDSCAPE' | 'PORTRAIT';
type ExtendedSauceLabsCapabilities = Capabilities.SauceLabsCapabilities & {
    deviceOrientation?: DeviceOrientation;
};
type RetriesSpecs = {
    sessionId: string;
    specFileNamePath: string;
};

export type { DeviceOrientation, ExtendedSauceLabsCapabilities, RetriesSpecs }
