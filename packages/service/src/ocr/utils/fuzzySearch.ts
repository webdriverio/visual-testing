import Fuse from 'fuse.js'
import type { FuzzyFindOptions } from '../types.js'

export function fuzzyFind(options: FuzzyFindOptions) {
    const { textArray, pattern, searchOptions } = options

    const fuzzyOptions = {
        ...searchOptions,
        // Defaults that should not be overwritten
        // See https://fusejs.io/api/options.html for more options
        ...{
            includeScore: true,
            isCaseSensitive: false,
            shouldSort: true,
            includeMatches: false,
            useExtendedSearch: false,
            ignoreLocation: false,
            ignoreFieldNorm: false,
            keys: ['text'],
        },
    }
    const fuse = new Fuse(textArray, fuzzyOptions)

    return fuse.search(pattern).map((item) => {
        if (item.score) {
            item.score = item.score < 1e-10 ? 0 : item.score
            return item
        }
    })
}
