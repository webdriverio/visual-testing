import { describe, it, expect, vi, beforeEach } from 'vitest'
import Fuse from 'fuse.js'
import { fuzzyFind } from '../../../src/ocr/utils/fuzzySearch.js'
import { DEFAULT_FUZZY_OPTIONS } from '../../../src/ocr/utils/constants.js'

vi.mock('fuse.js', () => {
    return {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        default: vi.fn().mockImplementation((items, { score = 0.5 }) => ({
            search: vi.fn().mockImplementation(pattern =>
                items.filter(item => item.text.includes(pattern)).map(item => ({ item, score, }))
            )
        }))
    }
})

describe('fuzzyFind', () => {
    let textArray
    beforeEach(() => {
        vi.clearAllMocks()
        textArray = [
            {
                dprPosition: { left: 1, right: 1, top: 1, bottom: 1 },
                originalPosition: { left: 1, right: 1, top: 1, bottom: 1 },
                text: 'example'
            }
        ]
    })

    it('initializes Fuse with the correct options and performs searches', () => {
        const pattern = 'ex'
        const searchOptions = { threshold: 0.3 }

        const results = fuzzyFind({
            textArray,
            pattern,
            searchOptions
        })

        expect(vi.mocked(Fuse)).toHaveBeenCalledWith(textArray, {
            ...DEFAULT_FUZZY_OPTIONS,
            ...searchOptions,
            includeMatches: false,
            includeScore: true,
            ignoreFieldNorm: false,
            ignoreLocation: false,
            keys: ['text'],
            shouldSort: true,
            useExtendedSearch: false,
        })

        expect(results.length).toBeGreaterThan(0)
        expect(results[0].score).toBeDefined()
    })

    it('returns an empty array when no matches are found', () => {
        const pattern = 'nonexistent'

        const results = fuzzyFind({
            textArray,
            pattern,
            searchOptions: {}
        })

        expect(results).toEqual([])
    })

    it('transforms scores and filters results correctly', () => {
        textArray = [
            {
                dprPosition: { left: 1, right: 1, top: 1, bottom: 1 },
                originalPosition: { left: 1, right: 1, top: 1, bottom: 1 },
                text: 'example2'
            },
            {
                dprPosition: { left: 1, right: 1, top: 1, bottom: 1 },
                originalPosition: { left: 1, right: 1, top: 1, bottom: 1 },
                text: 'notrelevant'
            },
        ]
        const pattern = 'example'

        const results = fuzzyFind({
            textArray,
            pattern,
            searchOptions: {}
        })

        results.forEach(result => {
            expect(result.score).not.toBeLessThan(0)
        })
        expect(results.some(result => result.item.text === 'notrelevant')).toBeFalsy()
    })

    it('adjusts low scores to zero', () => {
        const pattern = 'relevant'

        vi.mocked(Fuse).mockImplementationOnce(() => ({
            search: vi.fn().mockReturnValue([{ item: { text: 'relevant' }, score: 1e-11 }]),
            setCollection: vi.fn(),
            add: vi.fn(),
            remove: vi.fn(),
            removeAt: vi.fn(),
            getIndex: vi.fn()
        }))

        const results = fuzzyFind({
            textArray,
            pattern,
            searchOptions: {}
        })

        expect(results[0].score).toBe(0)
    })
})
