import getElementPositionTopDom from './getElementPositionTopDom'

describe('getElementPositionTopDom', () => {
    it('should get the element position to the top of the Dom', () => {
        document.body.innerHTML = '<div>' + '  <span id="username">Hello</span>' + '</div>'

        getElementPositionTopDom(document.querySelector('#username'))
    // I can't mock the offsetHeight, offsetWidth, offsetLeft, offsetTop with Jest, so there is no verification here, sorry :(
    // If you know a way, please add it here ;-)
    })
})
