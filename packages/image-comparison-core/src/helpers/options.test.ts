import { describe, it, expect, vi, beforeEach } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import { defaultOptions, methodCompareOptions, screenMethodCompareOptions, createBeforeScreenshotOptions, buildAfterScreenshotOptions, prepareIgnoreOptions, resolveActiveIgnorePreset, resolveComparePreset, warnOnMultipleIgnorePresets, assertExclusiveCompareMode, hasPixelmatchOptions, resolvePixelmatchOptions, CompareOptionsConflictError, resolveEffectiveCompareOptions, getCompareMode, methodSetsCompareMode, stripIgnoreOptionKeys, stripPixelmatchOptions } from './options.js'
import type { CompareModeOptions } from './options.js'
import type { ClassOptions } from './options.interfaces.js'
import type { ScreenMethodImageCompareCompareOptions } from '../methods/images.interfaces.js'
import type { InstanceData } from '../methods/instanceData.interfaces.js'
import type { BeforeScreenshotResult } from './beforeScreenshot.interfaces.js'

const log = logger('test')

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('options', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })
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

    describe('buildAfterScreenshotOptions', () => {
        const mockInstanceData: InstanceData = {
            appName: 'testApp',
            browserName: 'chrome',
            browserVersion: '120.0.0',
            deviceName: 'desktop',
            devicePixelRatio: 2,
            deviceRectangles: {
                bottomBar: { height: 0, width: 0, x: 0, y: 0 },
                homeBar: { height: 0, width: 0, x: 0, y: 0 },
                leftSidePadding: { height: 0, width: 0, x: 0, y: 0 },
                rightSidePadding: { height: 0, width: 0, x: 0, y: 0 },
                screenSize: { height: 1080, width: 1920 },
                statusBar: { height: 0, width: 0, x: 0, y: 0 },
                statusBarAndAddressBar: { height: 0, width: 0, x: 0, y: 0 },
                viewport: { height: 900, width: 1200, x: 0, y: 0 }
            },
            initialDevicePixelRatio: 2,
            isAndroid: false,
            isIOS: false,
            isMobile: false,
            logName: 'chrome',
            name: 'chrome',
            nativeWebScreenshot: false,
            platformName: 'desktop',
            platformVersion: '120.0.0'
        }
        const mockEnrichedInstanceData: BeforeScreenshotResult = {
            ...mockInstanceData,
            dimensions: {
                body: {
                    scrollHeight: 1000,
                    offsetHeight: 1000
                },
                html: {
                    clientWidth: 1200,
                    scrollWidth: 1200,
                    clientHeight: 900,
                    scrollHeight: 1000,
                    offsetHeight: 1000
                },
                window: {
                    devicePixelRatio: 3,
                    innerHeight: 800,
                    innerWidth: 1100,
                    isEmulated: false,
                    isLandscape: true,
                    outerHeight: 1000,
                    outerWidth: 1200,
                    screenHeight: 1440,
                    screenWidth: 2560,
                }
            },
            isAndroidChromeDriverScreenshot: false,
            isAndroidNativeWebScreenshot: false,
            isTestInBrowser: true,
            isTestInMobileBrowser: false,
            addressBarShadowPadding: 10,
            toolBarShadowPadding: 20
        }
        const baseInput = {
            base64Image: 'test-screenshot-data',
            folders: { actualFolder: '/test/actual' },
            tag: 'test-element',
            isNativeContext: false,
            instanceData: mockInstanceData,
            wicOptions: {
                formatImageName: '{tag}-{browserName}-{width}x{height}',
                savePerInstance: false,
                alwaysSaveActualImage: true
            }
        }

        it('should build options for native commands (no enriched data)', () => {
            const input = {
                ...baseInput,
                isNativeContext: true
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result).toMatchSnapshot()
            expect(result.isNativeContext).toBe(true)
            expect(result.isLandscape).toBe(false)
            expect(result.disableBlinkingCursor).toBeUndefined()
            expect(result.hideElements).toBeUndefined()
        })

        it('should build options for web commands with enriched data', () => {
            const beforeOptions = {
                instanceData: mockInstanceData,
                addressBarShadowPadding: 10,
                toolBarShadowPadding: 20,
                disableBlinkingCursor: true,
                disableCSSAnimation: false,
                enableLayoutTesting: true,
                hideElements: [] as HTMLElement[],
                noScrollBars: true,
                removeElements: [] as HTMLElement[],
                waitForFontsLoaded: false
            }
            const input = {
                ...baseInput,
                enrichedInstanceData: mockEnrichedInstanceData,
                beforeOptions
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result).toMatchSnapshot()
            expect(result.isNativeContext).toBe(false)
            expect(result.isLandscape).toBe(true)
            expect(result.disableBlinkingCursor).toBe(true)
            expect(result.disableCSSAnimation).toBe(false)
            expect(result.enableLayoutTesting).toBe(true)
            expect(result.hideScrollBars).toBe(true)
            expect(result.hideElements).toEqual([])
            expect(result.removeElements).toEqual([])
        })

        it('should prioritize enriched data over instance data', () => {
            const input = {
                ...baseInput,
                enrichedInstanceData: mockEnrichedInstanceData
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result.fileName.devicePixelRatio).toBe(3)
            expect(result.fileName.outerHeight).toBe(1000)
            expect(result.fileName.screenHeight).toBe(1440)
            expect(result.isLandscape).toBe(true)
        })

        it('should handle NaN values correctly', () => {
            const enrichedWithNaN: BeforeScreenshotResult = {
                ...mockEnrichedInstanceData,
                dimensions: {
                    ...mockEnrichedInstanceData.dimensions,
                    window: {
                        ...mockEnrichedInstanceData.dimensions.window,
                        devicePixelRatio: undefined,
                        outerHeight: undefined,
                        outerWidth: undefined,
                        screenHeight: undefined,
                        screenWidth: undefined,
                    }
                }
            }
            const input = {
                ...baseInput,
                enrichedInstanceData: enrichedWithNaN
            }

            const result = buildAfterScreenshotOptions(input)

            expect(result.fileName.devicePixelRatio).toBe(2)
            expect(result.fileName.outerHeight).toBeNaN()
            expect(result.fileName.outerWidth).toBeNaN()
            expect(result.fileName.screenHeight).toBe(1080)
            expect(result.fileName.screenWidth).toBe(1920)
        })

        it('should handle missing enriched data gracefully', () => {
            const input = {
                ...baseInput,
                enrichedInstanceData: undefined
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result.fileName.devicePixelRatio).toBe(2)
            expect(result.fileName.screenHeight).toBe(1080)
            expect(result.fileName.screenWidth).toBe(1920)
            expect(result.fileName.logName).toBe('chrome')
            expect(result.fileName.name).toBe('chrome')
            expect(result.isLandscape).toBe(false)
        })

        it('should handle element arrays from beforeOptions', () => {
            const mockElement = { tagName: 'DIV' } as HTMLElement
            const beforeOptions = {
                instanceData: mockInstanceData,
                addressBarShadowPadding: 10,
                toolBarShadowPadding: 20,
                disableBlinkingCursor: false,
                disableCSSAnimation: false,
                enableLayoutTesting: false,
                hideElements: [mockElement],
                noScrollBars: false,
                removeElements: [mockElement, mockElement],
                waitForFontsLoaded: false
            }
            const input = {
                ...baseInput,
                beforeOptions
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result.hideElements).toEqual([mockElement])
            expect(result.removeElements).toEqual([mockElement, mockElement])
        })

        it('should build correct filePath structure', () => {
            const input = {
                ...baseInput,
                wicOptions: {
                    formatImageName: '{tag}-{logName}',
                    savePerInstance: true
                }
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result.filePath).toEqual({
                browserName: 'chrome',
                deviceName: 'desktop',
                isMobile: false,
                savePerInstance: true
            })
        })

        it('should build correct fileName structure with all properties', () => {
            const input = {
                ...baseInput,
                enrichedInstanceData: mockEnrichedInstanceData
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result.fileName).toEqual({
                browserName: 'chrome',
                browserVersion: '120.0.0',
                deviceName: 'desktop',
                devicePixelRatio: 3,
                formatImageName: '{tag}-{browserName}-{width}x{height}',
                isMobile: false,
                isTestInBrowser: true,
                logName: 'chrome',
                name: 'chrome',
                outerHeight: 1000,
                outerWidth: 1200,
                platformName: 'desktop',
                platformVersion: '120.0.0',
                screenHeight: 1440,
                screenWidth: 2560,
                tag: 'test-element'
            })
        })

        it('should handle mobile device correctly', () => {
            const mobileInstanceData: InstanceData = {
                ...mockInstanceData,
                isMobile: true,
                deviceName: 'iPhone',
                platformName: 'iOS'
            }
            const mobileEnrichedData: BeforeScreenshotResult = {
                ...mockEnrichedInstanceData,
                isMobile: true,
                deviceName: 'iPhone',
                platformName: 'iOS'
            }
            const input = {
                ...baseInput,
                instanceData: mobileInstanceData,
                enrichedInstanceData: mobileEnrichedData
            }
            const result = buildAfterScreenshotOptions(input)

            expect(result.filePath.isMobile).toBe(true)
            expect(result.fileName.isMobile).toBe(true)
            expect(result.fileName.deviceName).toBe('iPhone')
            expect(result.platformName).toBe('iOS')
        })
    })

    describe('prepareIgnoreOptions', () => {
        it('includes antialiasing when ignoreAntialiasing is true', () => {
            expect(prepareIgnoreOptions({ ignoreAntialiasing: true })).toEqual(['antialiasing'])
        })

        it('omits antialiasing when ignoreAntialiasing is false', () => {
            expect(prepareIgnoreOptions({ ignoreAntialiasing: false })).toEqual([])
        })

        it('collects multiple enabled ignore flags', () => {
            expect(prepareIgnoreOptions({
                ignoreAlpha: true,
                ignoreAntialiasing: true,
                ignoreLess: true,
            })).toEqual(['alpha', 'antialiasing', 'less'])
        })
    })

    describe('resolveActiveIgnorePreset', () => {
        it.each([
            [['alpha'], 'alpha'],
            [['antialiasing'], 'antialiasing'],
            [['colors'], 'colors'],
            [['less'], 'less'],
            [['nothing'], 'nothing'],
            [[], null],
        ] as const)('returns %s for ignore list %j', (ignoreList, expected) => {
            expect(resolveActiveIgnorePreset([...ignoreList])).toBe(expected)
        })

        it('uses last-wins order matching prepareIgnoreOptions', () => {
            expect(resolveActiveIgnorePreset(['antialiasing', 'less'])).toBe('less')
            expect(resolveActiveIgnorePreset(['alpha', 'antialiasing', 'colors', 'less', 'nothing'])).toBe('nothing')
        })
    })

    describe('resolveComparePreset', () => {
        it.each([
            [['nothing'], { threshold: 0, includeAA: true }],
            [['less'], { threshold: 0.063, includeAA: true }],
            [['antialiasing'], { threshold: 0.13, includeAA: false }],
            [['alpha'], { threshold: 0.063, includeAA: true }],
            [['colors'], { threshold: 0.063, includeAA: true }],
            [[], { threshold: 0.063, includeAA: true }],
        ] as const)('maps ignore list %j to pixelmatch settings', (ignoreList, expected) => {
            expect(resolveComparePreset([...ignoreList])).toEqual(expected)
        })

        it('applies last-wins preset for multi-flag lists', () => {
            expect(resolveComparePreset(['antialiasing', 'less'])).toEqual({
                threshold: 0.063,
                includeAA: true,
            })
        })
    })

    describe('warnOnMultipleIgnorePresets', () => {
        it('does not warn when a single ignore preset is enabled', () => {
            warnOnMultipleIgnorePresets(['antialiasing'])

            expect(log.warn).not.toHaveBeenCalled()
        })

        it('warns with the active preset when multiple ignore flags are enabled', () => {
            warnOnMultipleIgnorePresets(['antialiasing', 'less'])

            expect(log.warn).toHaveBeenCalledWith(
                expect.stringContaining('Multiple ignore* compare options are enabled'),
                'ignoreAntialiasing, ignoreLess',
                'ignoreLess',
            )
        })
    })

    describe('assertExclusiveCompareMode', () => {
        it('throws when ignore* keys and non-empty pixelmatch are both present', () => {
            expect(() => assertExclusiveCompareMode({
                ignoreLess: false,
                pixelmatch: { threshold: 0.063 },
            }, 'compareOptions')).toThrow(CompareOptionsConflictError)
        })

        it('throws with a descriptive error message', () => {
            expect(() => assertExclusiveCompareMode({
                ignoreAntialiasing: false,
                ignoreLess: true,
                pixelmatch: { includeAA: true },
            }, 'checkScreen')).toThrowErrorMatchingSnapshot()
        })

        it('does not throw when only ignore* keys are present', () => {
            expect(() => assertExclusiveCompareMode({ ignoreLess: true }, 'compareOptions')).not.toThrow()
        })

        it('does not throw when only pixelmatch is present', () => {
            expect(() => assertExclusiveCompareMode({ pixelmatch: { threshold: 0.05 } }, 'compareOptions')).not.toThrow()
        })

        it('ignores empty pixelmatch object', () => {
            expect(hasPixelmatchOptions({ pixelmatch: {} })).toMatchSnapshot()
            expect(() => assertExclusiveCompareMode({
                ignoreAntialiasing: true,
                pixelmatch: {},
            }, 'compareOptions')).not.toThrow()
        })
    })

    describe('resolvePixelmatchOptions', () => {
        it('applies defaults for unset fields', () => {
            expect(resolvePixelmatchOptions({})).toMatchSnapshot()
        })

        it('preserves user overrides', () => {
            expect(resolvePixelmatchOptions({
                threshold: 0.05,
                diffColor: [255, 0, 0],
                diffMask: true,
            })).toMatchSnapshot()
        })
    })

    describe('defaultOptions pixelmatch mode', () => {
        it('omits ignore* defaults when pixelmatch mode is configured', () => {
            const result = defaultOptions({
                compareOptions: {
                    pixelmatch: { threshold: 0.063 },
                },
            })

            expect(result.compareOptions).toMatchSnapshot()
        })

        it('throws when service compareOptions combine ignore* with pixelmatch', () => {
            expect(() => defaultOptions({
                compareOptions: {
                    ignoreLess: false,
                    pixelmatch: { threshold: 0.063 },
                } as ClassOptions['compareOptions'],
            })).toThrow(CompareOptionsConflictError)
        })
    })

    describe('resolveEffectiveCompareOptions', () => {
        const wicPreset = {
            ignoreAntialiasing: true,
            scaleImagesToSameSize: false,
            blockOutSideBar: true,
        }
        const wicPixelmatch = {
            pixelmatch: { threshold: 0.1, includeAA: false },
            scaleImagesToSameSize: true,
        }

        it('strips ignore* when method sets pixelmatch', () => {
            const result = resolveEffectiveCompareOptions(wicPreset, {
                pixelmatch: { threshold: 0.05 },
            }, 'checkScreen')

            expect(result).toMatchSnapshot()
            expect(result).not.toHaveProperty('ignoreAntialiasing')
            expect(getCompareMode(result)).toBe('pixelmatch')
        })

        it('strips pixelmatch when method sets ignore*', () => {
            const result = resolveEffectiveCompareOptions(wicPixelmatch, {
                ignoreLess: true,
            }, 'checkElement')

            expect(result).toMatchSnapshot()
            expect(result).not.toHaveProperty('pixelmatch')
            expect(getCompareMode(result)).toBe('preset')
        })

        it('merges shared keys with method winning when method sets no compare mode', () => {
            const result = resolveEffectiveCompareOptions(wicPreset, {
                scaleImagesToSameSize: true,
            }, 'checkScreen')

            expect(result.scaleImagesToSameSize).toBe(true)
            expect(result.ignoreAntialiasing).toBe(true)
        })

        it('throws when method options combine ignore* with pixelmatch', () => {
            expect(() => resolveEffectiveCompareOptions(wicPreset, {
                ignoreLess: true,
                pixelmatch: { threshold: 0.05 },
            }, 'checkScreen')).toThrow(CompareOptionsConflictError)
        })

        it('warns when method overrides service compare mode', () => {
            resolveEffectiveCompareOptions(wicPreset, {
                pixelmatch: { threshold: 0.05 },
            }, 'checkScreen')

            expect(log.warn).toHaveBeenCalledWith(
                expect.stringContaining('Method compare options override service compare mode'),
                'checkScreen',
                expect.stringContaining('preset'),
                expect.stringContaining('pixelmatch'),
            )
        })
    })

    describe('compare mode helpers', () => {
        it('identifies when method sets compare mode', () => {
            expect(methodSetsCompareMode({ pixelmatch: { threshold: 0.1 } })).toBe(true)
            expect(methodSetsCompareMode({ ignoreLess: true })).toBe(true)
            expect(methodSetsCompareMode({ scaleImagesToSameSize: true } as CompareModeOptions)).toBe(false)
        })

        it('strips ignore* and pixelmatch keys', () => {
            expect(stripIgnoreOptionKeys({
                ignoreLess: true,
                pixelmatch: { threshold: 0.1 },
                scaleImagesToSameSize: true,
            })).toEqual({
                pixelmatch: { threshold: 0.1 },
                scaleImagesToSameSize: true,
            })
            expect(stripPixelmatchOptions({
                ignoreLess: true,
                pixelmatch: { threshold: 0.1 },
            })).toEqual({ ignoreLess: true })
        })
    })
})
