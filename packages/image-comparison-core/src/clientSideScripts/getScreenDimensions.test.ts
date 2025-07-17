// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'
import { CONFIGURABLE } from '../mocks/mocks.js'
import getScreenDimensions from './getScreenDimensions.js'

describe('getScreenDimensions', () => {
    it('should get the needed screen dimensions for a real device', () => {
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: true,
            })),
            ...CONFIGURABLE,
        })
        expect(getScreenDimensions(true)).toMatchSnapshot()
    })

    it('should get the needed screen dimensions', () => {
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: true,
            })),
            ...CONFIGURABLE,
        })
        expect(getScreenDimensions(false)).toMatchSnapshot()
    })

    it('should get the needed screen dimensions if the outerHeight and outerWidth are set to 0', () => {
        Object.defineProperty(window, 'outerHeight', { value: 0 })
        Object.defineProperty(window, 'outerWidth', { value: 0 })
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 1234 })
        Object.defineProperty(document.documentElement, 'clientWidth', { value: 4321 })
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: false,
            })),
            ...CONFIGURABLE,
        })

        expect(getScreenDimensions(false)).toMatchSnapshot()
    })

    it('should return zeroed dimensions if the document attributes are null', () => {
        Object.defineProperty(document, 'body', { value: null })
        Object.defineProperty(document, 'documentElement', { value: null })
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: false,
            })),
            ...CONFIGURABLE,
        })

        expect(getScreenDimensions(false)).toMatchSnapshot()
    })

    it('should detect mobile emulation and return emulated dimensions', () => {
        const mockScreen = {
            width: 375,
            height: 667
        }
        const originalScreen = window.screen

        Object.defineProperty(window, 'screen', {
            value: mockScreen,
            configurable: true,
            writable: true
        })
        Object.defineProperty(window, 'devicePixelRatio', { value: 3, configurable: true })
        Object.defineProperty(window, 'innerWidth', { value: 375, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 667, configurable: true })
        Object.defineProperty(window, 'outerWidth', { value: 375, configurable: true })
        Object.defineProperty(window, 'outerHeight', { value: 667, configurable: true })
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: false,
            })),
            ...CONFIGURABLE,
        })

        const dimensions = getScreenDimensions(false)

        Object.defineProperty(window, 'screen', {
            value: originalScreen,
            configurable: true,
            writable: true
        })

        expect(dimensions.dimensions.window.screenWidth).toBe(375)
        expect(dimensions.dimensions.window.screenHeight).toBe(667)
        expect(dimensions.dimensions.window.outerWidth).toBe(375)
        expect(dimensions.dimensions.window.outerHeight).toBe(667)
        expect(dimensions.dimensions.window.devicePixelRatio).toBe(3)
    })

    it('should handle desktop (non-emulated) dimensions correctly', () => {
        const mockScreen = {
            width: 1920,
            height: 1080
        }
        const originalScreen = window.screen

        Object.defineProperty(window, 'screen', {
            value: mockScreen,
            configurable: true,
            writable: true
        })
        Object.defineProperty(window, 'devicePixelRatio', { value: 1, configurable: true })
        Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
        Object.defineProperty(window, 'outerWidth', { value: 1440, configurable: true })
        Object.defineProperty(window, 'outerHeight', { value: 900, configurable: true })
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: true,
            })),
            ...CONFIGURABLE,
        })

        const dimensions = getScreenDimensions(false)

        Object.defineProperty(window, 'screen', {
            value: originalScreen,
            configurable: true,
            writable: true
        })

        expect(dimensions.dimensions.window.screenWidth).toBe(1920)
        expect(dimensions.dimensions.window.screenHeight).toBe(1080)
        expect(dimensions.dimensions.window.outerWidth).toBe(1440)
        expect(dimensions.dimensions.window.outerHeight).toBe(900)
        expect(dimensions.dimensions.window.devicePixelRatio).toBe(1)
    })

    it('should handle high DPI desktop displays', () => {
        const mockScreen = {
            width: 2880,
            height: 1800
        }
        const originalScreen = window.screen

        Object.defineProperty(window, 'screen', {
            value: mockScreen,
            configurable: true,
            writable: true
        })
        Object.defineProperty(window, 'devicePixelRatio', { value: 2, configurable: true })
        Object.defineProperty(window, 'innerWidth', { value: 1440, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true })
        Object.defineProperty(window, 'outerWidth', { value: 1440, configurable: true })
        Object.defineProperty(window, 'outerHeight', { value: 900, configurable: true })
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: true,
            })),
            ...CONFIGURABLE,
        })

        const dimensions = getScreenDimensions(false)

        Object.defineProperty(window, 'screen', {
            value: originalScreen,
            configurable: true,
            writable: true
        })

        expect(dimensions.dimensions.window.devicePixelRatio).toBe(2)
        expect(dimensions.dimensions.window.screenWidth).toBe(2880)
        expect(dimensions.dimensions.window.screenHeight).toBe(1800)
    })

    it('should handle zero devicePixelRatio', () => {
        Object.defineProperty(window, 'devicePixelRatio', { value: 0, configurable: true })
        Object.defineProperty(window, 'innerWidth', { value: 1920, configurable: true })
        Object.defineProperty(window, 'innerHeight', { value: 1080, configurable: true })
        Object.defineProperty(window, 'matchMedia', {
            value: vi.fn().mockImplementation(() => ({
                matches: true,
            })),
            ...CONFIGURABLE,
        })

        const dimensions = getScreenDimensions(false)
        expect(dimensions.dimensions.window.devicePixelRatio).toBe(1)
    })
})
