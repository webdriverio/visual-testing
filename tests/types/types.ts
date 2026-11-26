import type { Capabilities } from '@wdio/types'

type DeviceOrientation = 'landscape' | 'portrait'
// The Sauce Labs web configs use uppercase values
type SauceWebDeviceOrientation = 'LANDSCAPE' | 'PORTRAIT'
type ExtendedSauceLabsCapabilities = Omit<Capabilities.SauceLabsCapabilities, 'deviceOrientation'> & {
    deviceOrientation?: SauceWebDeviceOrientation;
}
type RetriesSpecs = {
    sessionId: string;
    specFileNamePath: string;
}
type SauceDeviceOptions = {
    appiumVersion?: string;
    build: string;
    deviceOrientation: DeviceOrientation;
}

export type { DeviceOrientation, ExtendedSauceLabsCapabilities, RetriesSpecs, SauceDeviceOptions, SauceWebDeviceOrientation }
