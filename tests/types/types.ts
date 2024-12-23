type DeviceOrientation = 'landscape' | 'portrait';
type RetriesSpecs = {
    sessionId: string;
    specFileNamePath: string;
};
type SauceDeviceOptions = {
    appiumVersion?: string;
    build: string;
    deviceOrientation: DeviceOrientation;
}

export type { DeviceOrientation, RetriesSpecs, SauceDeviceOptions }
