import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { join } from 'node:path'
import logger from '@wdio/logger'
import { promises as fsPromises, readFileSync, writeFileSync } from 'node:fs'
import * as utils from '../helpers/utils.js'
import * as rectangles from './rectangles.js'
import * as processDiffPixels from './processDiffPixels.js'
import * as createCompareReport from './createCompareReport.js'
import * as compareImages from '../resemble/compareImages.js'

const log = logger('test')

vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))
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
    calculateDprData: vi.fn(),
    prepareComparisonFilePaths: vi.fn()
}))
vi.mock('./rectangles.js', () => ({
    determineStatusAddressToolBarRectangles: vi.fn(),
    isWdioElement: vi.fn(),
    prepareIgnoreRectangles: vi.fn()
}))
vi.mock('./processDiffPixels.js', () => ({
    processDiffPixels: vi.fn(),
    generateAndSaveDiff: vi.fn()
}))
vi.mock('./createCompareReport.js', () => ({
    createCompareReport: vi.fn(),
    createJsonReportIfNeeded: vi.fn()
}))
vi.mock('../resemble/compareImages.js', () => ({
    default: vi.fn()
}))
vi.mock('../helpers/constants.js', () => ({
    DEFAULT_RESIZE_DIMENSIONS: { top: 0, right: 0, bottom: 0, left: 0 }
}))
vi.mock('process', () => ({
    argv: ['node', 'test.js']
}))
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

import { executeImageCompare, checkBaselineImageExists } from './images.js'
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
            alwaysSaveActualImage: true,
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

        vi.mocked(fsPromises.access).mockResolvedValue(undefined)
        vi.mocked(fsPromises.unlink).mockResolvedValue(undefined)
        vi.mocked(fsPromises.mkdir).mockResolvedValue(undefined)
        vi.mocked(fsPromises.writeFile).mockResolvedValue(undefined)
        vi.mocked(readFileSync).mockReturnValue(Buffer.from('mock-image-data'))
        vi.mocked(writeFileSync).mockReturnValue(undefined)
        vi.mocked(utils.getAndCreatePath).mockReturnValue('/mock/path')
        vi.mocked(utils.getBase64ScreenshotSize).mockReturnValue({ width: 100, height: 200 })
        vi.mocked(utils.updateVisualBaseline).mockReturnValue(false)
        vi.mocked(utils.calculateDprData).mockImplementation((rectangles) => rectangles)
        vi.mocked(utils.prepareComparisonFilePaths).mockReturnValue({
            actualFolderPath: '/mock/actual',
            baselineFolderPath: '/mock/baseline',
            diffFolderPath: '/mock/diff',
            actualFilePath: '/mock/actual/test.png',
            baselineFilePath: '/mock/baseline/test.png',
            diffFilePath: '/mock/diff/test.png'
        })
        vi.mocked(rectangles.determineStatusAddressToolBarRectangles).mockReturnValue(null as any)
        vi.mocked(rectangles.prepareIgnoreRectangles).mockResolvedValue({
            ignoredBoxes: [],
            hasIgnoreRectangles: false
        })
        vi.mocked(processDiffPixels.processDiffPixels).mockReturnValue([])
        vi.mocked(processDiffPixels.generateAndSaveDiff).mockResolvedValue({
            diffBoundingBoxes: [],
            storeDiffs: false
        })
        vi.mocked(createCompareReport.createCompareReport).mockReturnValue(undefined)
        vi.mocked(createCompareReport.createJsonReportIfNeeded).mockResolvedValue(undefined)
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5,
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })
        vi.mocked(images.checkBaselineImageExists).mockResolvedValue(undefined)
        vi.mocked(images.removeDiffImageIfExists).mockResolvedValue(undefined)
        vi.mocked(images.saveBase64Image).mockResolvedValue(undefined)
        vi.mocked(images.addBlockOuts).mockResolvedValue('mock-blockout-image')

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

        expect(result).toMatchSnapshot()
        expect(utils.prepareComparisonFilePaths).toHaveBeenCalledTimes(1)
        expect(utils.prepareComparisonFilePaths).toHaveBeenCalledWith({
            actualFolder: '/actual',
            baselineFolder: '/baseline',
            diffFolder: '/diff',
            browserName: 'chrome',
            deviceName: 'desktop',
            isMobile: false,
            savePerInstance: false,
            fileName: 'test.png'
        })
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

        vi.mocked(rectangles.prepareIgnoreRectangles).mockResolvedValue({
            ignoredBoxes: [{ left: 0, top: 0, right: 100, bottom: 50 }],
            hasIgnoreRectangles: true
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mobileOptions,
            testContext: mockTestContext
        })

        expect(rectangles.prepareIgnoreRectangles).toHaveBeenCalledWith({
            blockOut: [],
            ignoreRegions: [],
            deviceRectangles: mockOptions.deviceRectangles,
            devicePixelRatio: 2,
            isMobile: true,
            isNativeContext: false,
            isAndroid: false,
            isAndroidNativeWebScreenshot: false,
            isViewPortScreenshot: true,
            imageCompareOptions: {
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true
            }
        })
    })

    it('should filter out zero-sized rectangles', async () => {
        const mobileOptions = {
            ...mockOptions,
            folderOptions: { ...mockOptions.folderOptions, isMobile: true }
        }

        vi.mocked(rectangles.prepareIgnoreRectangles).mockResolvedValue({
            ignoredBoxes: [{ left: 10, top: 10, right: 60, bottom: 60 }], // Only non-zero rectangle
            hasIgnoreRectangles: true
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mobileOptions,
            testContext: mockTestContext
        })

        expect(rectangles.prepareIgnoreRectangles).toHaveBeenCalledWith({
            blockOut: [],
            ignoreRegions: [],
            deviceRectangles: mockOptions.deviceRectangles,
            devicePixelRatio: 2,
            isMobile: true,
            isNativeContext: false,
            isAndroid: false,
            isAndroidNativeWebScreenshot: false,
            isViewPortScreenshot: true,
            imageCompareOptions: {
                blockOutSideBar: undefined,
                blockOutStatusBar: undefined,
                blockOutToolBar: undefined
            }
        })
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

        vi.mocked(rectangles.prepareIgnoreRectangles).mockResolvedValue({
            ignoredBoxes: [],
            hasIgnoreRectangles: false
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mobileOptions,
            testContext: mockTestContext
        })

        expect(rectangles.prepareIgnoreRectangles).toHaveBeenCalledWith({
            blockOut: [],
            ignoreRegions: [],
            deviceRectangles: mockOptions.deviceRectangles,
            devicePixelRatio: 2,
            isMobile: true,
            isNativeContext: false,
            isAndroid: false,
            isAndroidNativeWebScreenshot: false,
            isViewPortScreenshot: true,
            imageCompareOptions: {
                blockOutSideBar: true,
                blockOutStatusBar: true,
                blockOutToolBar: true
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

        vi.mocked(rectangles.prepareIgnoreRectangles).mockResolvedValue({
            ignoredBoxes: [
                { left: 0, top: 0, right: 100, bottom: 50 },
                { left: 200, top: 200, right: 300, bottom: 300 }
            ],
            hasIgnoreRectangles: true
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithIgnore,
            testContext: mockTestContext
        })

        expect(rectangles.prepareIgnoreRectangles).toHaveBeenCalledWith({
            blockOut: [{ x: 200, y: 200, width: 100, height: 100 }],
            ignoreRegions: [{ x: 0, y: 0, width: 100, height: 50 }],
            deviceRectangles: mockOptions.deviceRectangles,
            devicePixelRatio: 2,
            isMobile: false,
            isNativeContext: false,
            isAndroid: false,
            isAndroidNativeWebScreenshot: false,
            isViewPortScreenshot: true,
            imageCompareOptions: {
                blockOutSideBar: undefined,
                blockOutStatusBar: undefined,
                blockOutToolBar: undefined
            }
        })
    })

    it('should create JSON report files when enabled', async () => {
        const optionsWithJsonReport = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: true,
            },
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

        vi.mocked(processDiffPixels.generateAndSaveDiff).mockResolvedValue({
            diffBoundingBoxes: [{ left: 5, top: 5, right: 15, bottom: 15 }],
            storeDiffs: true
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithJsonReport,
            testContext: mockTestContext
        })

        expect(processDiffPixels.generateAndSaveDiff).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                createJsonReportFiles: true,
                saveAboveTolerance: 0.1
            }),
            [],
            '/mock/diff/test.png',
            0.5
        )
        expect(createCompareReport.createJsonReportIfNeeded).toHaveBeenCalledWith({
            boundingBoxes: {
                diffBoundingBoxes: [{ left: 5, top: 5, right: 15, bottom: 15 }],
                ignoredBoxes: []
            },
            data: expect.any(Object),
            fileName: 'test.png',
            filePaths: {
                actualFolderPath: '/mock/actual',
                baselineFolderPath: '/mock/baseline',
                diffFolderPath: '/mock/diff',
                actualFilePath: '/mock/actual/test.png',
                baselineFilePath: '/mock/baseline/test.png',
                diffFilePath: '/mock/diff/test.png'
            },
            devicePixelRatio: 2,
            imageCompareOptions: expect.objectContaining({
                createJsonReportFiles: true,
                saveAboveTolerance: 0.1
            }),
            testContext: mockTestContext,
            storeDiffs: true
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

        expect(result).toMatchSnapshot()

        vi.mocked(utils.getAndCreatePath).mockReturnValueOnce('/mock/path/actual')
        vi.mocked(utils.getAndCreatePath).mockReturnValueOnce('/mock/path/baseline')
        vi.mocked(utils.getAndCreatePath).mockReturnValueOnce('/mock/path/diff')

        const resultWithoutDiff = await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithReturnAll,
            testContext: mockTestContext
        })

        expect(resultWithoutDiff).toMatchSnapshot()
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

        expect(result).toMatchSnapshot()
    })

    it('should handle updateVisualBaseline flag', async () => {
        vi.mocked(utils.updateVisualBaseline).mockReturnValue(true)

        const result = await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: mockOptions,
            testContext: mockTestContext
        })

        expect(result).toMatchSnapshot()
    })

    it('should compare from base64 when not saving actuals', async () => {
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithBase64 = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
                autoSaveBaseline: false,
            }
        }
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0,
            misMatchPercentage: 0,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithBase64,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(images.saveBase64Image).not.toHaveBeenCalled()
        expect(compareImages.default).toHaveBeenCalledWith(
            expect.any(Buffer),
            Buffer.from(base64Image, 'base64'),
            expect.any(Object),
        )
        expect(fsPromises.writeFile).not.toHaveBeenCalled()
    })

    it('should disable JSON reports when actuals are not saved', async () => {
        const optionsWithJsonButNoSave = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
            },
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    createJsonReportFiles: true,
                    saveAboveTolerance: 0.1,
                },
            },
        }

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithJsonButNoSave,
            testContext: mockTestContext,
            actualBase64Image: Buffer.from('base64-image').toString('base64'),
        })

        expect(logWarnSpy).toHaveBeenCalled()
        expect(createCompareReport.createJsonReportIfNeeded).toHaveBeenCalledWith(expect.objectContaining({
            imageCompareOptions: expect.objectContaining({ createJsonReportFiles: false }),
        }))
    })

    it('should save base64 actual for auto-saved baseline', async () => {
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithAutoSave = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
                autoSaveBaseline: true,
            }
        }

        vi.mocked(fsPromises.access).mockImplementation(async (path: any) => {
            if (path === '/mock/baseline/test.png') {
                throw new Error('File not found')
            }
            return undefined
        })

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0,
            misMatchPercentage: 0,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithAutoSave,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(fsPromises.writeFile).toHaveBeenCalledWith('/mock/actual/test.png', Buffer.from(base64Image, 'base64'))
    })

    it('should NOT save base64 actual on diff when alwaysSaveActualImage is false and saveAboveTolerance is not set (#1115)', async () => {
        // When alwaysSaveActualImage: false and saveAboveTolerance is not explicitly set,
        // actual images should never be saved - respecting the literal meaning of the option
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithDiff = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
            },
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: undefined,
                },
            },
        }
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5,
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithDiff,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(fsPromises.writeFile).not.toHaveBeenCalled()
    })

    it('should save base64 actual on diff when saveAboveTolerance is explicitly set to 0', async () => {
        // When saveAboveTolerance is explicitly set (even to 0), save actual images when diff exceeds it
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithDiff = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
            },
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 0,
                },
            },
        }
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5,
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithDiff,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(fsPromises.writeFile).toHaveBeenCalledWith('/mock/actual/test.png', Buffer.from(base64Image, 'base64'))
    })

    it('should not save base64 actual when diff is below saveAboveTolerance', async () => {
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithTolerance = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
            },
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 0.1,
                },
            },
        }
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.05,
            misMatchPercentage: 0.05,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithTolerance,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(fsPromises.writeFile).not.toHaveBeenCalled()
    })

    it('should save base64 actual when diff exceeds saveAboveTolerance', async () => {
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithTolerance = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
            },
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 0.1,
                },
            },
        }
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.2,
            misMatchPercentage: 0.2,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithTolerance,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(fsPromises.writeFile).toHaveBeenCalledWith('/mock/actual/test.png', Buffer.from(base64Image, 'base64'))
    })

    it('should update baseline using base64 when visual baseline is updated', async () => {
        const base64Image = Buffer.from('base64-image').toString('base64')
        vi.mocked(utils.updateVisualBaseline).mockReturnValueOnce(true)
        const optionsWithUpdate = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
            }
        }
        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0,
            misMatchPercentage: 0,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithUpdate,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(writeFileSync).toHaveBeenCalledWith('/mock/baseline/test.png', Buffer.from(base64Image, 'base64'))
    })

    it('should handle Android device pixel ratio correctly', async () => {
        const androidOptions = {
            ...mockOptions,
            isAndroid: true,
            devicePixelRatio: 3,
            ignoreRegions: [{ x: 0, y: 0, width: 100, height: 50 }]
        }

        vi.mocked(rectangles.prepareIgnoreRectangles).mockResolvedValue({
            ignoredBoxes: [{ left: 0, top: 0, right: 100, bottom: 50 }],
            hasIgnoreRectangles: true
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: androidOptions,
            testContext: mockTestContext
        })

        expect(rectangles.prepareIgnoreRectangles).toHaveBeenCalledWith({
            blockOut: [],
            ignoreRegions: [{ x: 0, y: 0, width: 100, height: 50 }],
            deviceRectangles: mockOptions.deviceRectangles,
            devicePixelRatio: 3,
            isMobile: false,
            isNativeContext: false,
            isAndroid: true,
            isAndroidNativeWebScreenshot: false,
            isViewPortScreenshot: true,
            imageCompareOptions: {
                blockOutSideBar: undefined,
                blockOutStatusBar: undefined,
                blockOutToolBar: undefined
            }
        })
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

        expect(rectangles.prepareIgnoreRectangles).toHaveBeenCalledWith({
            blockOut: [],
            ignoreRegions: [],
            deviceRectangles: mockOptions.deviceRectangles,
            devicePixelRatio: 2,
            isMobile: true,
            isNativeContext: true,
            isAndroid: false,
            isAndroidNativeWebScreenshot: false,
            isViewPortScreenshot: true,
            imageCompareOptions: {
                blockOutSideBar: undefined,
                blockOutStatusBar: undefined,
                blockOutToolBar: undefined
            }
        })
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

        vi.mocked(rectangles.prepareIgnoreRectangles).mockResolvedValue({
            ignoredBoxes: [{ bottom: 50, right: 100, left: 0, top: 0 }],
            hasIgnoreRectangles: true
        })

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

        expect(utils.prepareComparisonFilePaths).toHaveBeenCalledTimes(1)
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
            rawMisMatchPercentage: 0.5,
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })

        vi.mocked(processDiffPixels.generateAndSaveDiff).mockResolvedValue({
            diffBoundingBoxes: [],
            storeDiffs: true
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithHighTolerance,
            testContext: mockTestContext
        })

        expect(processDiffPixels.generateAndSaveDiff).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                saveAboveTolerance: 0.1
            }),
            [],
            '/mock/diff/test.png',
            0.5
        )
    })

    it('should store diffs when process.argv includes --store-diffs flag', async () => {
        const originalArgv = process.argv
        process.argv = [...originalArgv, '--store-diffs']

        const optionsWithLowTolerance = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 1.0
                }
            }
        }

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5,
            misMatchPercentage: 0.5,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 100, bottom: 200 },
            analysisTime: 100,
            diffPixels: []
        })

        vi.mocked(processDiffPixels.generateAndSaveDiff).mockResolvedValue({
            diffBoundingBoxes: [],
            storeDiffs: true
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithLowTolerance,
            testContext: mockTestContext
        })

        expect(processDiffPixels.generateAndSaveDiff).toHaveBeenCalledWith(
            expect.any(Object),
            expect.objectContaining({
                saveAboveTolerance: 1.0
            }),
            [],
            '/mock/diff/test.png',
            0.5
        )

        process.argv = originalArgv
    })

    it('should not store diffs when rawMisMatchPercentage is below tolerance and no --store-diffs flag', async () => {
        const optionsWithHighTolerance = {
            ...mockOptions,
            compareOptions: {
                ...mockOptions.compareOptions,
                wic: {
                    ...mockOptions.compareOptions.wic,
                    saveAboveTolerance: 1.0
                }
            }
        }

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0.5,
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

        expect(images.saveBase64Image).not.toHaveBeenCalled()
        expect(log.warn).not.toHaveBeenCalled()
    })

    it('should not save actual image when autoSaveBaseline is true, alwaysSaveActualImage is false, baseline exists, and comparison passes', async () => {
        // This test covers issue #1085: autoSaveBaseline collides with alwaysSaveActualImage
        // When baseline exists and comparison passes, actual image should NOT be saved
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithAutoSave = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
                autoSaveBaseline: true,
            }
        }

        vi.mocked(fsPromises.access).mockResolvedValue(undefined)

        vi.mocked(images.checkBaselineImageExists).mockImplementation(async () => {
            return Promise.resolve()
        })

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0,
            misMatchPercentage: 0,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithAutoSave,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })

        expect(images.saveBase64Image).not.toHaveBeenCalled()
        expect(fsPromises.writeFile).not.toHaveBeenCalledWith('/mock/actual/test.png', expect.anything())
    })

    it('should not save actual image when baseline does not exist, alwaysSaveActualImage is false, and autoSaveBaseline is false', async () => {
        // This test covers issue #1098: When both flags are false, we respect the user's choice
        // and provide a helpful error message suggesting to adjust the arguments if needed
        const base64Image = Buffer.from('base64-image').toString('base64')
        const optionsWithoutAutoSave = {
            ...mockOptions,
            folderOptions: {
                ...mockOptions.folderOptions,
                alwaysSaveActualImage: false,
                autoSaveBaseline: false,
            }
        }

        vi.mocked(fsPromises.access).mockImplementation(async (path: any) => {
            if (path === '/mock/baseline/test.png' || path === '/mock/actual/test.png') {
                throw new Error('File not found')
            }
            return undefined
        })

        vi.mocked(images.checkBaselineImageExists).mockImplementation(checkBaselineImageExists)

        vi.mocked(compareImages.default).mockResolvedValue({
            rawMisMatchPercentage: 0,
            misMatchPercentage: 0,
            getBuffer: vi.fn().mockResolvedValue(Buffer.from('diff-image-data')),
            diffBounds: { left: 0, top: 0, right: 0, bottom: 0 },
            analysisTime: 10,
            diffPixels: []
        })

        await expect(executeImageCompare({
            isViewPortScreenshot: true,
            isNativeContext: false,
            options: optionsWithoutAutoSave,
            testContext: mockTestContext,
            actualBase64Image: base64Image,
        })).rejects.toThrow(/If you need the actual image to create a baseline, please set alwaysSaveActualImage to true/)

        expect(images.saveBase64Image).not.toHaveBeenCalled()
    })
})
