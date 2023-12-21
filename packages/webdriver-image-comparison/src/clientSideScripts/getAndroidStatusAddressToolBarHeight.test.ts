// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import { ANDROID_OFFSETS } from '../helpers/constants.js'
import { ANDROID_DEVICES, NAVIGATOR_APP_VERSIONS, CONFIGURABLE } from '../mocks/mocks.js'
import getAndroidStatusAddressToolBarOffsets from './getAndroidStatusAddressToolBarOffsets.js'

describe('getAndroidStatusAddressToolBarOffsets', () => {
    it('should get the android status, address and toolbar height with only a major version in the navigator', () => {
        setEnvironment('ANDROID', 9, 'NEXUS_5X')

        expect(getAndroidStatusAddressToolBarOffsets(ANDROID_OFFSETS, { isHybridApp: false, isLandscape: false })).toMatchSnapshot()
    })

    it('should get the android status, address and toolbar height with major and minor version in the navigator', () => {
        setEnvironment('ANDROID', 8, 'NEXUS_5X')

        expect(getAndroidStatusAddressToolBarOffsets(ANDROID_OFFSETS, { isHybridApp: false, isLandscape: false })).toMatchSnapshot()
    })

    it('should get the android status, address and toolbar height with major, minor and patch version in the navigator', () => {
        setEnvironment('ANDROID', 7, 'NEXUS_5X')

        expect(getAndroidStatusAddressToolBarOffsets(ANDROID_OFFSETS, { isHybridApp: false, isLandscape: false })).toMatchSnapshot()
    })

    it('should set the default toolbar height when the toolbar height will become negative', () => {
        setEnvironment('ANDROID', 7, 'NEXUS_5X_INNER_HEIGHT')

        expect(getAndroidStatusAddressToolBarOffsets(ANDROID_OFFSETS, { isHybridApp: true, isLandscape: false })).toMatchSnapshot()
    })

    it('should set the dimensions properly for a device in landscape mode', () => {
        setEnvironment('ANDROID', 7, 'NEXUS_5X')

        expect(getAndroidStatusAddressToolBarOffsets(ANDROID_OFFSETS, { isHybridApp: true, isLandscape: true })).toMatchSnapshot()
    })

    it('should set the dimensions properly for a table in landscape mode', () => {
        setEnvironment('ANDROID', 7, 'TABLET_WIDTH')

        expect(getAndroidStatusAddressToolBarOffsets(ANDROID_OFFSETS, { isHybridApp: true, isLandscape: true })).toMatchSnapshot()
    })
})

/**
 * Set the environment for the test
 */
function setEnvironment(os: string, version: number, deviceType: string) {
    // @ts-ignore
    Object.defineProperty(navigator, 'appVersion', { value: NAVIGATOR_APP_VERSIONS[os][version], ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(window.screen, 'width', { value: ANDROID_DEVICES[deviceType].width, ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(window.screen, 'height', { value: ANDROID_DEVICES[deviceType].height, ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(window, 'innerWidth', { value: ANDROID_DEVICES[deviceType].innerWidth, ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(window, 'innerHeight', { value: ANDROID_DEVICES[deviceType].innerHeight, ...CONFIGURABLE })
}
