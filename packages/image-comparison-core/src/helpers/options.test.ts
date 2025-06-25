import { describe, it, expect } from 'vitest'
import { defaultOptions, methodCompareOptions, screenMethodCompareOptions, createBeforeScreenshotOptions } from './options.js'
import type { ClassOptions } from './options.interfaces.js'
import type { ScreenMethodImageCompareCompareOptions } from '../methods/images.interfaces.js'

describe('options', () => {
    describe('defaultOptions', () => {
        it('should return the default options when no options are provided', () => {
            expect(defaultOptions({})).toMatchSnapshot()
        })

        it('should return the provided options when options are provided', () => {
            const options: ClassOptions = {
                addressBarShadowPadding: 1,
                autoSaveBaseline: true,
                formatImageName: '{foo}-{bar}',
                savePerInstance: true,
                toolBarShadowPadding: 1,
                disableBlinkingCursor: true,
                disableCSSAnimation: true,
                fullPageScrollTimeout: 12345,
                hideScrollBars: true,
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                createJsonReportFiles: true,
                diffPixelBoundingBoxProximity: 123,
                ignoreAlpha: true,
                ignoreAntialiasing: true,
                ignoreColors: true,
                ignoreLess: true,
                ignoreNothing: true,
                rawMisMatchPercentage: true,
                returnAllCompareData: true,
                saveAboveTolerance: 12,
                scaleImagesToSameSize: true,
                tabbableOptions: {
                    circle: {
                        backgroundColor: 'backgroundColor',
                        borderColor: 'borderColor',
                        borderWidth: 123,
                        fontColor: 'fontColor',
                        fontFamily: 'fontFamily',
                        fontSize: 321,
                        size: 567,
                        showNumber: false,
                    },
                    line: {
                        color: 'color',
                        width: 987,
                    },
                },
            }

            expect(defaultOptions(options)).toMatchSnapshot()
        })
    })

    describe('methodCompareOptions', () => {
        it('should not return the method options when no options are provided', () => {
            expect(methodCompareOptions({})).toMatchSnapshot()
        })

        it('should return the provided options when options are provided', () => {
            const options = {
                blockOut: [{ height: 1, width: 2, x: 3, y: 4 }],
                ignoreAlpha: true,
                ignoreAntialiasing: true,
                ignoreColors: true,
                ignoreLess: true,
                ignoreNothing: true,
                rawMisMatchPercentage: true,
                returnAllCompareData: true,
                saveAboveTolerance: 12,
                scaleImagesToSameSize: true,
            }

            expect(methodCompareOptions(options)).toMatchSnapshot()
        })
    })

    describe('screenMethodCompareOptions', () => {
        it('should not return the screen method options when no options are provided', () => {
            expect(screenMethodCompareOptions({})).toMatchSnapshot()
        })

        it('should return the provided options when options are provided', () => {
            const options: ScreenMethodImageCompareCompareOptions = {
                blockOutSideBar: false,
                blockOutStatusBar: false,
                blockOutToolBar: false,
                blockOut: [{ height: 1, width: 2, x: 3, y: 4 }],
                ignoreAlpha: true,
                ignoreAntialiasing: true,
                ignoreColors: true,
                ignoreLess: true,
                ignoreNothing: true,
                rawMisMatchPercentage: true,
                returnAllCompareData: true,
                saveAboveTolerance: 12,
                scaleImagesToSameSize: true,
            }

            expect(screenMethodCompareOptions(options)).toMatchSnapshot()
        })
    })

    describe('createBeforeScreenshotOptions', () => {
        const mockElement = { tagName: 'DIV' } as HTMLElement
        const baseWicOptions = {
            addressBarShadowPadding: 10,
            toolBarShadowPadding: 20,
        }

        it('should create options with defaults when minimal options are provided', () => {
            const result = createBeforeScreenshotOptions('testInstance', {}, baseWicOptions)

            expect(result).toEqual({
                instanceData: 'testInstance',
                addressBarShadowPadding: 10,
                toolBarShadowPadding: 20,
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                hideElements: [],
                noScrollBars: false,
                removeElements: [],
                waitForFontsLoaded: false,
            })
        })

        it('should prioritize methodOptions over wicOptions for overlapping properties', () => {
            const methodOptions = {
                disableBlinkingCursor: true,
                disableCSSAnimation: true,
                hideScrollBars: true,
            }
            const wicOptions = {
                ...baseWicOptions,
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                hideScrollBars: false,
            }

            const result = createBeforeScreenshotOptions('testInstance', methodOptions, wicOptions)

            expect(result.disableBlinkingCursor).toBe(true)
            expect(result.disableCSSAnimation).toBe(true)
            expect(result.noScrollBars).toBe(true)
        })

        it('should use wicOptions when methodOptions are undefined', () => {
            const wicOptions = {
                ...baseWicOptions,
                disableBlinkingCursor: true,
                enableLayoutTesting: true,
                waitForFontsLoaded: true,
            }

            const result = createBeforeScreenshotOptions('testInstance', {}, wicOptions)

            expect(result.disableBlinkingCursor).toBe(true)
            expect(result.enableLayoutTesting).toBe(true)
            expect(result.waitForFontsLoaded).toBe(true)
        })

        it('should handle element arrays from methodOptions', () => {
            const hideElements = [mockElement]
            const removeElements = [mockElement, mockElement]
            const methodOptions = {
                hideElements,
                removeElements,
            }

            const result = createBeforeScreenshotOptions('testInstance', methodOptions, baseWicOptions)

            expect(result.hideElements).toBe(hideElements)
            expect(result.removeElements).toBe(removeElements)
        })

        it('should handle all boolean options set to true in methodOptions', () => {
            const methodOptions = {
                disableBlinkingCursor: true,
                disableCSSAnimation: true,
                enableLayoutTesting: true,
                hideScrollBars: true,
                waitForFontsLoaded: true,
            }

            const result = createBeforeScreenshotOptions('testInstance', methodOptions, baseWicOptions)

            expect(result.disableBlinkingCursor).toBe(true)
            expect(result.disableCSSAnimation).toBe(true)
            expect(result.enableLayoutTesting).toBe(true)
            expect(result.noScrollBars).toBe(true)
            expect(result.waitForFontsLoaded).toBe(true)
        })

        it('should preserve instanceData exactly as passed', () => {
            const complexInstanceData = { browser: 'chrome', version: '120', viewport: { width: 1920, height: 1080 } }

            const result = createBeforeScreenshotOptions(complexInstanceData, {}, baseWicOptions)

            expect(result.instanceData).toBe(complexInstanceData)
        })
    })
})
