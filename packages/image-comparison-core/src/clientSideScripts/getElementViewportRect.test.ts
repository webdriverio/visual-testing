// @vitest-environment jsdom

import { describe, it, expect, vi } from 'vitest'
import getElementViewportRect from './getElementViewportRect.js'

describe('getElementViewportRect', () => {
    it('should return the position in the viewport, not rounded', () => {
        const element = document.createElement('div')
        vi.spyOn(element, 'getBoundingClientRect').mockReturnValue(DOMRect.fromRect({ x: 10.5, y: -20.25, width: 100.75, height: 50 }))

        expect(getElementViewportRect(element)).toEqual({ x: 10.5, y: -20.25, width: 100.75, height: 50 })
    })
})
