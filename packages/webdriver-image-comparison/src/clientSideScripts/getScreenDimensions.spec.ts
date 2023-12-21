import { CONFIGURABLE } from '../mocks/mocks'
import getScreenDimensions from './getScreenDimensions'

describe('getScreenDimensions', () => {
    it('should get the needed screen dimensions', () => {
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn().mockImplementation(() => ({
                matches: true,
            })),
            ...CONFIGURABLE,
        })
        expect(getScreenDimensions()).toMatchSnapshot()
    })

    it('should get the needed screen dimensions if the outerHeight and outerWidth are set to 0', () => {
        Object.defineProperty(window, 'outerHeight', { value: 0 })
        Object.defineProperty(window, 'outerWidth', { value: 0 })
        Object.defineProperty(document.documentElement, 'clientHeight', { value: 1234 })
        Object.defineProperty(document.documentElement, 'clientWidth', { value: 4321 }) // @ts-ignore
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn().mockImplementation(() => ({
                matches: false,
            })),
            ...CONFIGURABLE,
        })

        expect(getScreenDimensions()).toMatchSnapshot()
    })

    it('should return zeroed dimensions if the document attributes are null', () => {
        Object.defineProperty(document, 'body', { value: null })
        Object.defineProperty(document, 'documentElement', { value: null })
        Object.defineProperty(window, 'matchMedia', {
            value: jest.fn().mockImplementation(() => ({
                matches: false,
            })),
            ...CONFIGURABLE,
        })

        expect(getScreenDimensions()).toMatchSnapshot()
    })
})
