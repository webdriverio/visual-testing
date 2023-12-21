import getElementPositionTopWindow from './getElementPositionTopWindow'

describe('getElementPositionTopWindow', () => {
    it('should the the element position to the top of the window', () => {
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

        expect(getElementPositionTopWindow(document.querySelector('#username'))).toMatchSnapshot()
    })
})
