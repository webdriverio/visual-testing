// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import hideRemoveElements from './hideRemoveElements.js'

describe('hideRemoveElements', () => {
    it('should be able to hide elements and put them back again', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span id="id-1">Hello</span>' +
            '   <span id="id-2">Hello</span>' +
            '   <div>' +
            '     <span id="id-3">Hello</span>' +
            '     <span id="id-4">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [<HTMLElement>document.querySelector('#id-1'), <HTMLElement>document.querySelector('#id-3')],
                remove: [],
            },
            true,
        )

        // Check hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [<HTMLElement>document.querySelector('#id-1'), <HTMLElement>document.querySelector('#id-3')],
                remove: [],
            },
            false,
        )

        // Check not hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
    })

    it('should be able to hide elements and put them back again when an array of hidden elements is provided', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span class="hide">Hello</span>' +
            '   <span class="hide">Hello</span>' +
            '   <div>' +
            '     <span id="id-3">Hello</span>' +
            '     <span class="hide">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not hidden
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[0].style.visibility).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[1].style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[2].style.visibility).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [[...(<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))]],
                remove: [],
            },
            true,
        )

        // Check hidden
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[0].style.visibility).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[1].style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[2].style.visibility).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [[...(<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))]],
                remove: [],
            },
            false,
        )

        // Check not hidden
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[0].style.visibility).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[1].style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.hide')))[2].style.visibility).toMatchSnapshot()
    })

    it('should be able to remove elements and put them back again', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span id="id-1">Hello</span>' +
            '   <span id="id-2">Hello</span>' +
            '   <div>' +
            '     <span id="id-3">Hello</span>' +
            '     <span id="id-4">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not removed
        expect((<HTMLElement>document.querySelector('#id-2')).style.display).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-4')).style.display).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [],
                remove: [<HTMLElement>document.querySelector('#id-2'), <HTMLElement>document.querySelector('#id-4')],
            },
            true,
        )

        // Check removed
        expect((<HTMLElement>document.querySelector('#id-2')).style.display).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-4')).style.display).toMatchSnapshot()

        hideRemoveElements(
            {
                remove: [<HTMLElement>document.querySelector('#id-2'), <HTMLElement>document.querySelector('#id-4')],
                hide: [],
            },
            false,
        )

        // Check not removed
        expect((<HTMLElement>document.querySelector('#id-2')).style.display).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-4')).style.display).toMatchSnapshot()
    })

    it('should be able to remove elements and put them back again when an array of to be removed elements is provided', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span class="remove">Hello</span>' +
            '   <span class="remove">Hello</span>' +
            '   <div>' +
            '     <span id="id-3">Hello</span>' +
            '     <span class="remove">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not hidden
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[0].style.display).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[1].style.display).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.display).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[2].style.display).toMatchSnapshot()

        hideRemoveElements(
            {
                remove: [[...(<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))]],
                hide: [],
            },
            true,
        )

        // Check hidden
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[0].style.display).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[1].style.display).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.display).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[2].style.display).toMatchSnapshot()

        hideRemoveElements(
            {
                remove: [[...(<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))]],
                hide: [],
            },
            false,
        )

        // Check not hidden
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[0].style.display).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[1].style.display).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.display).toMatchSnapshot()
        expect((<HTMLElement[]>(<unknown>document.querySelectorAll('.remove')))[2].style.display).toMatchSnapshot()
    })

    it('should be able to find and hide single element based on xpath', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span id="id-1">Hello</span>' +
            '   <span id="id-2">Hello</span>' +
            '   <div>' +
            '     <span id="id-3">Hello</span>' +
            '     <span id="id-4">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [<any>{ selector: "//span[@id='id-1']" }, <any>{ selector: "//span[@id='id-3']" }],
                remove: [],
            },
            true,
        )

        // Check hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
    })

    it('should be able to find and hide elements based on xpath', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span id="id-1">Hello</span>' +
            '   <span id="id-2">Hello</span>' +
            '   <div>' +
            '     <span id="id-3">Hello</span>' +
            '     <span id="id-4">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-2')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-4')).style.visibility).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [[<any>{ selector: '//span' }]],
                remove: [],
            },
            true,
        )

        // Check hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-2')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-4')).style.visibility).toMatchSnapshot()
    })

    it('should be able to find and hide a single element based on a css selector', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span id="id-1">Hello</span>' +
            '   <span id="id-2">Hello</span>' +
            '   <div>' +
            '     <span id="id-3">Hello</span>' +
            '     <span class="hide">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-2')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('.hide')).style.visibility).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [<any>{ selector: '.hide' }],
                remove: [],
            },
            true,
        )

        // Check hidden
        expect((<HTMLElement>document.querySelector('#id-1')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-2')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('#id-3')).style.visibility).toMatchSnapshot()
        expect((<HTMLElement>document.querySelector('.hide')).style.visibility).toMatchSnapshot()
    })

    it('should be able to find and hide elements based on a css selector', () => {
        document.body.innerHTML =
            '<div>' +
            '   <span class="hide">Hello</span>' +
            '   <span class="hide">Hello</span>' +
            '   <div>' +
            '     <span class="hide">Hello</span>' +
            '     <span class="hide">Hello</span>' +
            '  </div>' +
            '</div>'

        // Check not hidden
        expect(<HTMLElement[]>(<unknown>document.querySelectorAll('.hide'))).toMatchSnapshot()

        hideRemoveElements(
            {
                hide: [[<any>{ selector: '.hide' }, <any>{ selector: '.hide' }]],
                remove: [],
            },
            true,
        )

        // Check hidden
        expect(<HTMLElement[]>(<unknown>document.querySelectorAll('.hide'))).toMatchSnapshot()
    })
})
