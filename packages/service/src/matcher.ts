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
    tag: string,
    expectedResult: Result,
    options: WdioCheckScreenMethodOptions
) {
    const result = await browser.checkScreen(tag, options)
    return expect(result).toEqual(expectedResult)
}

export async function toMatchFullPageSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResult: Result,
    options: WdioCheckFullPageMethodOptions
) {
    const result = await browser.checkFullPageScreen(tag, options)
    return expect(result).toEqual(expectedResult)
}

export async function toMatchElementSnapshot (
    element: WebdriverIO.Element,
    tag: string,
    expectedResult: Result,
    options: WdioCheckElementMethodOptions
) {
    const browser = getBrowserObject(element)
    const result = await browser.checkElement(await element, tag, options)
    return expect(result).toEqual(expectedResult)
}

export async function toMatchTabbablePageSnapshot (
    browser: WebdriverIO.Browser,
    tag: string,
    expectedResult: Result,
    options: WdioCheckFullPageMethodOptions
) {
    const result = await browser.checkFullPageScreen(tag, options)
    return expect(result).toEqual(expectedResult)
}
