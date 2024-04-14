import Fuse from 'fuse.js'
import type { FuzzyElement, FuzzyFindOptions } from '../types.js'

export function fuzzyFind(options: FuzzyFindOptions): FuzzyElement[] | [] {
    const { textArray, pattern, searchOptions } = options

    const fuzzyOptions = {
        // Defaults that can be overwritten
        distance: 100,
        isCaseSensitive: false,
        findAllMatches: false,
        location: 0,
        minMatchCharLength: 2,
        threshold: 0.6,
        // Provided options
        ...searchOptions,
        // Defaults that should not be overwritten
        // See https://fusejs.io/api/options.html for more options
        ...{
            includeMatches: false,
            includeScore: true,
            ignoreFieldNorm: false,
            ignoreLocation: false,
            keys: ['text'],
            shouldSort: true,
            useExtendedSearch: false,
        },
    }
    const fuse = new Fuse(textArray, fuzzyOptions)

    return fuse.search(pattern).map((item) => {
        if (item.score) {
            item.score = item.score < 1e-10 ? 0 : item.score
            return item
        }
    }).filter((item): item is FuzzyElement => item !== undefined)
}
