// @vitest-environment jsdom

import { describe, it, expect, beforeEach } from 'vitest'
import { checkMetaTag } from './checkMetaTag.js'

describe('checkMetaTag', () => {
    beforeEach(() => {
        document.head.innerHTML = ''
    })

    it('should add a viewport meta tag when not present', () => {
        expect(document.querySelector('meta[name="viewport"]')).toBeNull()

        checkMetaTag()

        const meta = document.querySelector('meta[name="viewport"]') as HTMLMetaElement
        expect(meta).not.toBeNull()
        expect(meta?.content).toBe('width=device-width, initial-scale=1')
    })

    it('should not add a viewport meta tag if one already exists', () => {
        const existing = document.createElement('meta')
        existing.name = 'viewport'
        existing.content = 'custom'
        document.head.appendChild(existing)

        checkMetaTag()

        const metas = Array.from(document.querySelectorAll('meta[name="viewport"]')) as HTMLMetaElement[]
        expect(metas.length).toBe(1)
        expect(metas[0].content).toBe('custom')
    })
})
