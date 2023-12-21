import { describe, it, expect, beforeEach } from 'vitest'
import { IOS_DEVICES, CONFIGURABLE } from '../mocks/mocks.js'
import { getElementPositionTopScreenNativeMobile } from './getElementPositionTopScreenNativeMobile.js'

describe('getElementPositionTopScreenNativeMobile', () => {
    beforeEach(() => {
    // @ts-ignore
        Element.prototype.getBoundingClientRect = jest.fn(() => {
            return {
                width: 120,
                height: 120,
                top: 10,
                left: 100,
                bottom: 5,
                right: 12,
            }
        })
        document.body.innerHTML = '<div>' + '  <span id="username">Hello</span>' + '</div>'
    })

    it('should get the element position to the top of the screen for a mobile browser', () => {
        Object.defineProperty(window, 'innerHeight', { value: IOS_DEVICES.IPHONE.innerHeight, ...CONFIGURABLE })

        expect(
            getElementPositionTopScreenNativeMobile(document.querySelector('#username')!, {
                isLandscape: false,
                safeArea: 0,
                screenHeight: IOS_DEVICES.IPHONE.height,
                screenWidth: IOS_DEVICES.IPHONE.width,
                sideBarWidth: IOS_DEVICES.IPHONE.sideBar,
                statusBarAddressBarHeight: 94,
            }),
        ).toMatchSnapshot()
    })

    it('should get the element position to the top of the screen for an app in portrait mode', () => {
        Object.defineProperty(window, 'innerHeight', { value: IOS_DEVICES.IPHONE.height, ...CONFIGURABLE })

        expect(
            getElementPositionTopScreenNativeMobile(document.querySelector('#username')!, {
                isLandscape: false,
                safeArea: 0,
                screenHeight: IOS_DEVICES.IPHONE.height,
                screenWidth: IOS_DEVICES.IPHONE.width,
                sideBarWidth: IOS_DEVICES.IPHONE.sideBar,
                statusBarAddressBarHeight: 94,
            }),
        ).toMatchSnapshot()
    })

    it('should get the element position to the top of the screen for an app in landscape mode', () => {
        Object.defineProperty(window, 'innerHeight', { value: IOS_DEVICES.IPHONE.width, ...CONFIGURABLE })

        expect(
            getElementPositionTopScreenNativeMobile(document.querySelector('#username')!, {
                isLandscape: true,
                safeArea: 44,
                screenHeight: IOS_DEVICES.IPHONE.innerHeight,
                screenWidth: IOS_DEVICES.IPHONE.width,
                sideBarWidth: IOS_DEVICES.IPHONE.sideBar,
                statusBarAddressBarHeight: 94,
            }),
        ).toMatchSnapshot()
    })
})
