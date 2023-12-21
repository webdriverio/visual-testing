// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import { IOS_DEVICES, NAVIGATOR_APP_VERSIONS, CONFIGURABLE } from '../mocks/mocks.js'
import getIosStatusAddressToolBarOffsets from './getIosStatusAddressToolBarOffsets.js'
import { IOS_OFFSETS } from '../helpers/constants.js'

describe('getIosStatusAddressToolBarOffsets', () => {
    it('should get the correct status, address and toolbar height for a default iPhone with iOS 14 in Portrait mode', () => {
        setEnvironment('IOS', 14, 'IPHONE')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, false)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for a default iPhone with iOS 14 in landscape mode', () => {
        setEnvironment('IOS', 14, 'IPHONE')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, true)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for a default iPhone with iOS 15 in portrait mode', () => {
        setEnvironment('IOS', 15, 'IPHONE_X')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, false)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for a default iPhone with iOS 15 in landscape mode', () => {
        setEnvironment('IOS', 15, 'IPHONE_X')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, true)).toMatchSnapshot()
    })

    it('should get the correct status bar height for an iPhone 11 with iOS 13 to validate the iPhone 11 hack', () => {
        setEnvironment('IOS', 13, 'IPHONE_11')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, false)).toMatchSnapshot()
    })

    it('should get the correct status bar height for an iPhone 11 with iOS 13 to validate the iPhone 11 hack in landscape mode', () => {
        setEnvironment('IOS', 13, 'IPHONE_11')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, true)).toMatchSnapshot()
    })

    it('should get the correct status bar height for an iPhone 11 with iOS 15', () => {
        setEnvironment('IOS', 15, 'IPHONE_11')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, false)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for an iPhone with extreme not known dimensions', () => {
        setEnvironment('IOS', 15, 'IPHONE_HEIGHT')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, false)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for an iPad', () => {
        setEnvironment('IOS', 15, 'IPAD')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, false)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for an iPad with big sizes', () => {
        setEnvironment('IOS', 15, 'IPAD_BIG_SIZE')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, false)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for an iPad in landscape mode', () => {
        setEnvironment('IOS', 15, 'IPAD_LANDSCAPE')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, true)).toMatchSnapshot()
    })

    it('should get the correct status, address and toolbar height for the iPad Pro 12.9 2017 hack in landscape mode', () => {
        setEnvironment('IOS', 15, 'IPAD_PRO_LANDSCAPE')

        expect(getIosStatusAddressToolBarOffsets(IOS_OFFSETS, true)).toMatchSnapshot()
    })
})

/**
 * Set the environment for the test
 */
function setEnvironment(os: string, version: number, deviceType: string) {
    // @ts-ignore
    Object.defineProperty(navigator, 'appVersion', { value: NAVIGATOR_APP_VERSIONS[os][version], ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(window.screen, 'width', { value: IOS_DEVICES[deviceType].width, ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(global.document, 'documentElement', {
    // @ts-ignore
        value: { scrollWidth: IOS_DEVICES[deviceType].scrollWidth },
        ...CONFIGURABLE,
    })
    // @ts-ignore
    Object.defineProperty(window.screen, 'height', { value: IOS_DEVICES[deviceType].height, ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(window, 'innerWidth', { value: IOS_DEVICES[deviceType].innerWidth, ...CONFIGURABLE })
    // @ts-ignore
    Object.defineProperty(window, 'innerHeight', { value: IOS_DEVICES[deviceType].innerHeight, ...CONFIGURABLE })
}
