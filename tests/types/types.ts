import type { SauceLabsCapabilities } from '@wdio/types/build/Capabilities'

type DeviceOrientation = 'LANDSCAPE' | 'PORTRAIT';
type ExtendedSauceLabsCapabilities = SauceLabsCapabilities & {
    deviceOrientation?: DeviceOrientation;
};
type RetriesSpecs = {
    sessionId: string;
    specFileNamePath: string;
};

export type { DeviceOrientation, ExtendedSauceLabsCapabilities, RetriesSpecs }
