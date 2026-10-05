import type { DeviceOrientation, SauceWebDeviceOrientation } from '../types/types.ts'

/**
 * The Sauce Labs web configs use uppercase orientations (as `appium:orientation` does),
 * but `sauce:options.deviceOrientation` uses lowercase values
 */
export function toSauceLabsDeviceOrientation(orientation?: SauceWebDeviceOrientation): DeviceOrientation | undefined {
    if (orientation === undefined) {
        return undefined
    }
    return orientation === 'LANDSCAPE' ? 'landscape' : 'portrait'
}
