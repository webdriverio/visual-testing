// @vitest-environment jsdom

import { describe, it, expect } from 'vitest'
import { getBoundingClientRect } from './getBoundingClientRect.js'

describe('getBoundingClientRect', () => {
    it('should return rounded values of the bounding client rect', () => {
        const element = document.createElement('div')
        Object.defineProperty(element, 'getBoundingClientRect', {
            value: () => ({
                x: 10.7,
                y: 20.4,
                width: 100.9,
                height: 200.3,
                top: 20.4,
                left: 10.7,
                bottom: 220.7,
                right: 110.9,
                toJSON: () => {},
            }),
        })

        const result = getBoundingClientRect(element)

        expect(result).toEqual({
            x: 11,
            y: 20,
            width: 101,
            height: 200,
        })
    })
})
