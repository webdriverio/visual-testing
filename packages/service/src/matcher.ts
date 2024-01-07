import { expect } from '@wdio/globals'
import { getBrowserObject } from './utils.js'

import type {
    Result,
    WdioCheckFullPageMethodOptions,
    WdioCheckElementMethodOptions,
    WdioCheckScreenMethodOptions
} from './types.js'

export async function toMatchScreenSnapshot (
    browser: WebdriverIO.Browser,
    options: WdioCheckScreenMethodOptions & { tag: string },
    expectedResult: Result
) {
    const { tag, ...screenOptions } = options
    const result = await browser.checkScreen(tag, screenOptions)
    return expect(result).toEqual(expectedResult)
}

export async function toMatchFullPageSnapshot (
    browser: WebdriverIO.Browser,
    options: WdioCheckFullPageMethodOptions & { tag: string },
    expectedResult: Result
) {
    const { tag, ...fullPageOptions } = options
    const result = await browser.checkFullPageScreen(tag, fullPageOptions)
    return expect(result).toEqual(expectedResult)
}

export async function toMatchElementSnapshot (
    element: WebdriverIO.Element,
    options: WdioCheckElementMethodOptions & { tag: string },
    expectedResult: Result
) {
    const browser = getBrowserObject(element)
    const { tag, ...elementOptions } = options
    const result = await browser.checkElement(await element, tag, elementOptions)
    return expect(result).toEqual(expectedResult)
}
export async function toMatchTabbablePageSnapshot (
    browser: WebdriverIO.Browser,
    options: WdioCheckFullPageMethodOptions & { tag: string },
    expectedResult: Result
) {
    const { tag, ...tabbableOptions } = options
    const result = await browser.checkFullPageScreen(tag, tabbableOptions)
    return expect(result).toEqual(expectedResult)
}
