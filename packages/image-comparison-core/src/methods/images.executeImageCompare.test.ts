import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import { promises as fsPromises } from 'node:fs'
import { readFileSync, writeFileSync } from 'node:fs'
import * as utils from '../helpers/utils.js'
import * as rectangles from './rectangles.js'
import * as processDiffPixels from './processDiffPixels.js'
import * as createCompareReport from './createCompareReport.js'
import * as compareImages from '../resemble/compareImages.js'

const log = logger('test')

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

// Mock Jimp BEFORE importing the module under test
vi.mock('jimp', () => {
    const mockImage = {
        composite: vi.fn().mockReturnThis(),
        getBase64: vi.fn().mockResolvedValue('data:image/png;base64,mock-image-data'),
        opacity: vi.fn().mockReturnThis(),
        width: 100,
        height: 200,
        bitmap: { width: 100, height: 200 },
        background: 0,
        formats: [],
        inspect: vi.fn().mockReturnValue('MockImage'),
        toString: vi.fn().mockReturnValue('MockImage'),
        scanIterator: vi.fn(),
        scan: vi.fn(),
        scanQuiet: vi.fn(),
        scanIteratorQuiet: vi.fn(),
        scanQuietIterator: vi.fn(),
        scanQuietIteratorQuiet: vi.fn(),
    }

    const JimpMock = vi.fn().mockImplementation(() => mockImage) as any
    JimpMock.read = vi.fn().mockResolvedValue(mockImage)
    JimpMock.MIME_PNG = 'image/png'

    return {
        Jimp: JimpMock,
        JimpMime: {
            png: 'image/png',
        },
    }
})

// Mock all dependencies
vi.mock('node:fs', async () => {
    const actual = await vi.importActual('node:fs')
    return {
        ...actual,
        promises: {
            access: vi.fn(),
            unlink: vi.fn(),
            mkdir: vi.fn(),
            writeFile: vi.fn()
        },
        readFileSync: vi.fn(),
        writeFileSync: vi.fn(),
        constants: {
            R_OK: 4,
        },
    }
})

vi.mock('../helpers/utils.js', () => ({
    getAndCreatePath: vi.fn(),
    getBase64ScreenshotSize: vi.fn(),
    updateVisualBaseline: vi.fn(),
    calculateDprData: vi.fn()
}))

vi.mock('./rectangles.js', () => ({
    determineStatusAddressToolBarRectangles: vi.fn(),
    isWdioElement: vi.fn()
}))

vi.mock('./processDiffPixels.js', () => ({
    processDiffPixels: vi.fn()
}))

vi.mock('./createCompareReport.js', () => ({
    createCompareReport: vi.fn()
}))

vi.mock('../resemble/compareImages.js', () => ({
    default: vi.fn()
}))

// Mock the constants module
vi.mock('../helpers/constants.js', () => ({
    DEFAULT_RESIZE_DIMENSIONS: { top: 0, right: 0, bottom: 0, left: 0 }
}))

// Mock process.argv
vi.mock('process', () => ({
    argv: ['node', 'test.js']
}))

// Mock the internal functions from the same module
vi.mock('./images.js', async () => {
    const actual = await vi.importActual('./images.js')
    return {
        ...actual,
        checkBaselineImageExists: vi.fn(),
        removeDiffImageIfExists: vi.fn(),
        saveBase64Image: vi.fn(),
        addBlockOuts: vi.fn(),
    }
})

// Now import the function after all mocks are set up
import { executeImageCompare } from './images.js'
import * as images from './images.js'

describe('executeImageCompare', () => {
    const mockDeviceRectangles = {
        bottomBar: { x: 0, y: 0, width: 0, height: 0 },
        homeBar: { x: 0, y: 0, width: 0, height: 0 },
        leftSidePadding: { x: 0, y: 0, width: 0, height: 0 },
        rightSidePadding: { x: 0, y: 0, width: 0, height: 0 },
        screenSize: { width: 1920, height: 1080 },
        statusBarAndAddressBar: { x: 0, y: 0, width: 0, height: 0 },
        statusBar: { x: 0, y: 0, width: 0, height: 0 },
        viewport: { x: 0, y: 0, width: 1920, height: 1080 }
    }

    const mockOptions = {
        devicePixelRatio: 2,
        deviceRectangles: mockDeviceRectangles,
        ignoreRegions: [],
        isAndroidNativeWebScreenshot: false,
        isAndroid: false,
        fileName: 'test.png',
        folderOptions: {
            actualFolder: '/actual',
            autoSaveBaseline: false,
            baselineFolder: '/baseline',
            browserName: 'chrome',
            deviceName: 'desktop',
            diffFolder: '/diff',
            isMobile: false,
            savePerInstance: false
        },
        compareOptions: {
            wic: {
                scaleImagesToSameSize: true,
                rawMisMatchPercentage: false,
                saveAboveTolerance: 0,
                createJsonReportFiles: false,
                diffPixelBoundingBoxProximity: 10,
                returnAllCompareData: false
            },
            method: {}
        }
    }

    const mockTestContext = {
        commandName: 'test',
        framework: 'mocha',
        parent: 'Test Suite',
        tag: 'test',
        title: 'Test Title',
        instanceData: {
            browser: { name: 'chrome', version: '100' },
            deviceName: 'desktop',
            platform: { name: 'windows', version: '10' },
            app: 'test-app',
            isMobile: false,
            isAndroid: false,
            isIOS: false
        }
    }

    let logWarnSpy: ReturnType<typeof vi.spyOn>

    beforeEach(async () => {
        vi.clearAllMocks()

        // Mock Jimp - following the pattern from images.test.ts
        const jimp = await import('jimp')
        const jimpReadMock = vi.mocked(jimp.Jimp.read)

        const mockImage = {
            composite: vi.fn().mockReturnThis(),
            getBase64: vi.fn().mockResolvedValue('data:image/png;base64,mock-image-data'),
            opacity: vi.fn().mockReturnThis(),
            width: 100,
            height: 200,
            bitmap: { width: 100, height: 200 },
            background: 0,
            formats: [],
            inspect: vi.fn().mockReturnValue('MockImage'),
            toString: vi.fn().mockReturnValue('MockImage'),
            scanIterator: vi.fn(),
            scan: vi.fn(),
            scanQuiet: vi.fn(),
            scanIteratorQuiet: vi.fn(),
            scanQuietIterator: vi.fn(),
            scanQuietIteratorQuiet: vi.fn(),
        } as any
        jimpReadMock.mockResolvedValue(mockImage)

        // Mock fsPromises methods
        vi.mocked(fsPromises.access).mockResolvedValue(undefined)
        vi.mocked(fsPromises.unlink).mockResolvedValue(undefined)
        vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined)
        vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined)

        // Mock fs methods
        vi.mocked(readFileSync).mockReturnValue(Buffer.from('mock-image-data'))
        vi.mocked(writeFileSync).mockReturnValue(undefined)

        // Mock utils
        vi.mocked(utils.getAndCreatePath).mockReturnValue('/mock/path')
        vi.mocked(utils.getBase64ScreenshotSize).mockReturnValue({ width: 100, height: 200 })
        vi.mocked(utils.updateVisualBaseline).mockReturnValue(false)
        vi.mocked(utils.calculateDprData).mockImplementation((rectangles) => rectangles)

        // Mock rectangles
        vi.mocked(rectangles.determineStatusAddressToolBarRectangles).mockReturnValue(null as any)

        // Mock processDiffPixels
        vi.mocked(processDiffPixels.processDiffPixels).mockReturnValue([])

        // Mock createCompareReport
        vi.mocked(createCompareReport.createCompareReport).mockReturnValue(undefined)

        // Mock compareImages
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5,
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })

        // Mock internal functions
        vi.mocked(images.checkBaselineImageExists).mockResolvedValue(undefined)
        vi.mocked(images.removeDiffImageIfExists).mockResolvedValue(undefined)
        vi.mocked(images.saveBase64Image).mockResolvedValue(undefined)
        vi.mocked(images.addBlockOuts).mockResolvedValue('mock-blockout-image')

        // Set up log spies
        logWarnSpy = vi.spyOn(log, 'warn')
    })

    afterEach(() => {
        vi.clearAllMocks()
        logWarnSpy.mockRestore()
    })

    it('should execute image comparison successfully with default options', async () => {
        const result = await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mockOptions,
            testContext: mockTestContext
        })

        expect(result).toBe(0.5)
        expect(utils.getAndCreatePath).toHaveBeenCalledTimes(3)
        expect(compareImages.default).toHaveBeenCalledWith(
            Buffer.from('mock-image-data'),
            Buffer.from('mock-image-data'),
            {
                ignore: [],
                scaleToSameSize: true
            }
        )
    })

    it('should handle mobile context with status/address/toolbar rectangles', async () => {
        const mobileOptions = {
            ...mockOptions,
            folderOptions: { ...mockOptions.folderOptions, isMobile: true },
            compareOptions: {
                ...mockOptions.compareOptions,
                method: {
                    blockOutSideBar: true,
                    blockOutStatusBar: true,
                    blockOutToolBar: true
                }
            }
        }

        vi.mocked(rectangles.determineStatusAddressToolBarRectangles).mockReturnValue([
            { x: 0, y: 0, width: 100, height: 50 }
        ])

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mobileOptions,
            testContext: mockTestContext
        })

        expect(rectangles.determineStatusAddressToolBarRectangles).toHaveBeenCalledWith({
            deviceRectangles: mockOptions.deviceRectangles,
            options: {
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isMobile: true,
                isViewPortScreenshot: true
            }
        })
    })

    it('should filter out zero-sized rectangles', async () => {
        const mobileOptions = {
            ...mockOptions,
            folderOptions: { ...mockOptions.folderOptions, isMobile: true }
        }

        vi.mocked(rectangles.determineStatusAddressToolBarRectangles).mockReturnValue([
            { x: 0, y: 0, width: 0, height: 0 },
            { x: 10, y: 10, width: 50, height: 50 }
        ])

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mobileOptions,
            testContext: mockTestContext
        })

        expect(utils.calculateDprData).toHaveBeenCalledWith(
            { bottom: 60, right: 60, left: 10, top: 10 },
            2
        )
    })

    it('should handle when determineStatusAddressToolBarRectangles returns null', async () => {
        const mobileOptions = {
            ...mockOptions,
            folderOptions: { ...mockOptions.folderOptions, isMobile: true },
            compareOptions: {
                ...mockOptions.compareOptions,
                method: {
                    blockOutSideBar: true,
                    blockOutStatusBar: true,
                    blockOutToolBar: true
                }
            }
        }

        // Mock to return null to cover the || [] branch on line 385
        vi.mocked(rectangles.determineStatusAddressToolBarRectangles).mockReturnValue(null as any)

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mobileOptions,
            testContext: mockTestContext
        })

        expect(rectangles.determineStatusAddressToolBarRectangles).toHaveBeenCalledWith({
            deviceRectangles: mockOptions.deviceRectangles,
            options: {
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true,
                isAndroid: false,
                isAndroidNativeWebScreenshot: false,
                isMobile: true,
                isViewPortScreenshot: true
            }
        })
    })

    it('should handle ignore regions and blockOut rectangles', async () => {
        const optionsWithIgnore = {
            ...mockOptions,
            ignoreRegions: [{ x: 0, y: 0, width: 100, height: 50 }],
            compareOptions: {
                ...mockOptions.compareOptions,
                method: {
                    blockOut: [{ x: 200, y: 200, width: 100, height: 100 }]
                }
            }
        }

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithIgnore,
            testContext: mockTestContext
        })

        expect(utils.calculateDprData).toHaveBeenCalledTimes(2)
    })

    it('should create JSON report files when enabled', async () => {
        const optionsWithJsonReport = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    createJsonReportFiles: true,
                    saveAboveTolerance: 0.1
                }
            }
        }

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5,
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: [{ x: 10, y: 10 }]
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithJsonReport,
            testContext: mockTestContext
        })

        expect(processDiffPixels.processDiffPixels).toHaveBeenCalledWith([{ x: 10, y: 10 }], 10)
        expect(createCompareReport.createCompareReport).toHaveBeenCalledWith({
            boundingBoxes: {
                diffBoundingBoxes: [],
                ignoredBoxes: []
            },
            data: expect.any(Object),
            fileName: 'test.png',
            folders: {
                actualFolderPath: '/mock/path',
                baselineFolderPath: '/mock/path',
                diffFolderPath: '/mock/path'
            },
            size: {
                actual: { width: 100, height: 200 },
                baseline: { width: 100, height: 200 },
                diff: { width: 100, height: 200 }
            },
            testContext: mockTestContext
        })
    })

    it('should return all compare data when returnAllCompareData is true', async () => {
        const optionsWithReturnAll = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    returnAllCompareData: true
                }
            }
        }

        const result = await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithReturnAll,
            testContext: mockTestContext
        })

        expect(result).toEqual({
            fileName: 'test.png',
            folders: {
                actual: '/mock/path/test.png',
                baseline: '/mock/path/test.png',
                diff: '/mock/path/test.png'
            },
            misMatchPercentage: 0.5
        })

        vi.mocked(utils.getAndCreatePath).mockReturnValueOnce('/mock/path/actual') // actual
        vi.mocked(utils.getAndCreatePath).mockReturnValueOnce('/mock/path/baseline') // baseline
        vi.mocked(utils.getAndCreatePath).mockReturnValueOnce('/mock/path/diff') // diff

        const resultWithoutDiff = await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithReturnAll,
            testContext: mockTestContext
        })

        expect(resultWithoutDiff).toEqual({
            fileName: 'test.png',
            folders: {
                actual: '/mock/path/actual/test.png',
                baseline: '/mock/path/baseline/test.png',
                diff: '/mock/path/diff/test.png',
            },
            misMatchPercentage: 0.5
        })
    })

    it('should handle rawMisMatchPercentage option', async () => {
        const optionsWithRaw = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    rawMisMatchPercentage: true
                }
            }
        }

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.123456,
            misMatchPercentage: 0.12,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })

        const result = await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithRaw,
            testContext: mockTestContext
        })

        expect(result).toBe(0.123456)
    })

    it('should handle updateVisualBaseline flag', async () => {
        vi.mocked(utils.updateVisualBaseline).mockReturnValue(true)

        const result = await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mockOptions,
            testContext: mockTestContext
        })

        expect(result).toBe(0)
    })

    it('should handle Android device pixel ratio correctly', async () => {
        const androidOptions = {
            ...mockOptions,
            isAndroid: true,
            devicePixelRatio: 3,
            ignoreRegions: [{ x: 0, y: 0, width: 100, height: 50 }]
        }

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: androidOptions,
            testContext: mockTestContext
        })

        expect(utils.calculateDprData).toHaveBeenCalledWith(
            expect.any(Object),
            1
        )
    })

    it('should handle ignore options from compareOptions', async () => {
        const optionsWithIgnore = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                method: {
                    ignoreAlpha: true,
                    ignoreAntialiasing: true,
                    ignoreColors: true,
                    ignoreLess: true,
                    ignoreNothing: true
                }
            }
        }

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithIgnore,
            testContext: mockTestContext
        })

        expect(compareImages.default).toHaveBeenCalledWith(
            expect.any(Buffer),
            expect.any(Buffer),
            {
                ignore: ['alpha', 'antialiasing', 'colors', 'less', 'nothing'],
                scaleToSameSize: true
            }
        )
    })

    it('should handle native context without status/address/toolbar rectangles', async () => {
        const mobileOptions = {
            ...mockOptions,
            folderOptions: { ...mockOptions.folderOptions, isMobile: true }
        }

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: true,
            options: mobileOptions,
            testContext: mockTestContext
        })

        expect(rectangles.determineStatusAddressToolBarRectangles).not.toHaveBeenCalled()
    })

    it('should handle case when no ignored boxes are present', async () => {
        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mockOptions,
            testContext: mockTestContext
        })

        expect(compareImages.default).toHaveBeenCalledWith(
            expect.any(Buffer),
            expect.any(Buffer),
            {
                ignore: [],
                scaleToSameSize: true
            }
        )
    })

    it('should handle case when ignored boxes are present', async () => {
        const optionsWithBlockOut = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                method: {
                    blockOut: [{ x: 0, y: 0, width: 100, height: 50 }]
                }
            }
        }

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithBlockOut,
            testContext: mockTestContext
        })

        expect(compareImages.default).toHaveBeenCalledWith(
            expect.any(Buffer),
            expect.any(Buffer),
            {
                ignore: [],
                output: { ignoredBoxes: [{ bottom: 50, right: 100, left: 0, top: 0 }] },
                scaleToSameSize: true
            }
        )
    })

    it('should handle undefined saveAboveTolerance (nullish coalescing)', async () => {
        const optionsWithUndefinedTolerance = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: undefined
                }
            }
        }

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithUndefinedTolerance,
            testContext: mockTestContext
        })

        // The test passes if it doesn't throw, confirming nullish coalescing works
        expect(utils.getAndCreatePath).toHaveBeenCalledTimes(3)
    })

    it('should store diffs when rawMisMatchPercentage exceeds saveAboveTolerance', async () => {
        const optionsWithHighTolerance = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 0.1
                }
            }
        }

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5, // This is > 0.1, so storeDiffs should be true
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithHighTolerance,
            testContext: mockTestContext
        })

        // Test the side effect - the warning log when diff is saved
        expect(logWarnSpy).toHaveBeenCalledWith(
            '\x1b[33m%s\x1b[0m',
            expect.stringContaining('WARNING:\n There was a difference. Saved the difference to')
        )
    })

    it('should store diffs when process.argv includes --store-diffs flag', async () => {
        // Mock process.argv to include --store-diffs
        const originalArgv = process.argv
        process.argv = [...originalArgv, '--store-diffs']

        const optionsWithLowTolerance = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 1.0 // High tolerance, so rawMisMatchPercentage won't exceed it
                }
            }
        }

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5, // This is < 1.0, but --store-diffs flag should trigger storage
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithLowTolerance,
            testContext: mockTestContext
        })

        // Test the side effect - the info log when debug mode saves diff
        expect(logWarnSpy).toHaveBeenCalledWith(
            '\x1b[33m%s\x1b[0m',
            expect.stringContaining('INFO:\n Debug mode is enabled. Saved the debug file to:')
        )

        // Restore original process.argv
        process.argv = originalArgv
    })

    it('should not store diffs when rawMisMatchPercentage is below tolerance and no --store-diffs flag', async () => {
        const optionsWithHighTolerance = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 1.0 // High tolerance
                }
            }
        }

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5, // This is < 1.0
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithHighTolerance,
            testContext: mockTestContext
        })

        // Should not save diff image when rawMisMatchPercentage < saveAboveTolerance and no --store-diffs
        expect(images.saveBase64Image).not.toHaveBeenCalled()
        expect(log.warn).not.toHaveBeenCalled()
    })
})
