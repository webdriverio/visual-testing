import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeFileSync, readFileSync } from 'node:fs'
import { createCompareReport, createJsonReportIfNeeded } from './createCompareReport.js'
import type { CompareData } from '../resemble/compare.interfaces.js'
import type { BoundingBox, IgnoreBoxes } from './rectangles.interfaces.js'
import type { BaseDimensions } from '../base.interfaces.js'
import { getBase64ScreenshotSize } from '../helpers/utils.js'

vi.mock('node:fs', () => ({
    writeFileSync: vi.fn(),
    readFileSync: vi.fn(),
}))

vi.mock('../helpers/utils.js', () => ({
    getBase64ScreenshotSize: vi.fn(),
}))

describe('createCompareReport', () => {
    const createMockData = (misMatchPercentage = 0): CompareData => ({
        misMatchPercentage,
        rawMisMatchPercentage: misMatchPercentage,
        getBuffer: () => Buffer.from(''),
        diffBounds: { top: 0, left: 0, bottom: 0, right: 0 },
        analysisTime: 0,
        diffPixels: [],
    })

    const createMockFolders = () => ({
        actualFolderPath: '/actual',
        baselineFolderPath: '/baseline',
        diffFolderPath: '/diff',
    })

    const createMockSize = (): { actual: BaseDimensions; baseline: BaseDimensions; diff: BaseDimensions } => ({
        actual: { width: 100, height: 100 },
        baseline: { width: 100, height: 100 },
        diff: { width: 100, height: 100 },
    })

    const createMockBoundingBoxes = () => ({
        diffBoundingBoxes: [] as BoundingBox[],
        ignoredBoxes: [] as IgnoreBoxes[],
    })

    const createTestContext = (options: {
        app?: string;
        browser?: { name: string; version: string };
        deviceName?: string;
        isIOS?: boolean;
        isAndroid?: boolean;
        isMobile?: boolean;
        platform?: { name: string; version: string };
    } = {}) => ({
        commandName: 'test-command',
        instanceData: {
            app: options.app ?? 'not-known',
            browser: options.browser ?? { name: 'chrome', version: '100' },
            deviceName: options.deviceName ?? 'desktop',
            isIOS: options.isIOS ?? false,
            isAndroid: options.isAndroid ?? false,
            isMobile: options.isMobile ?? false,
            platform: options.platform ?? { name: 'windows', version: '10' },
        },
        framework: 'wdio',
        parent: 'test parent',
        tag: 'test-tag',
        title: 'test title',
    })

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('should create a report for desktop browser', () => {
        createCompareReport({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            folders: createMockFolders(),
            size: createMockSize(),
            testContext: createTestContext(),
        })

        const writtenData = JSON.parse((writeFileSync as any).mock.calls[0][1])
        expect(writtenData).toMatchSnapshot()
    })

    it('should create a report for mobile browser', () => {
        createCompareReport({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            folders: createMockFolders(),
            size: createMockSize(),
            testContext: createTestContext({
                browser: { name: 'safari', version: '15' },
                deviceName: 'iPhone 12',
                isIOS: true,
                isMobile: true,
                platform: { name: 'ios', version: '15' },
            }),
        })

        const writtenData = JSON.parse((writeFileSync as any).mock.calls[0][1])
        expect(writtenData).toMatchSnapshot()
    })

    it('should create a report for mobile app', () => {
        createCompareReport({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            folders: createMockFolders(),
            size: createMockSize(),
            testContext: createTestContext({
                app: 'my-app',
                deviceName: 'Pixel 6',
                isAndroid: true,
                isMobile: true,
                platform: { name: 'android', version: '12' },
            }),
        })

        const writtenData = JSON.parse((writeFileSync as any).mock.calls[0][1])
        expect(writtenData).toMatchSnapshot()
    })

    it('should include misMatchPercentage in the report', () => {
        createCompareReport({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(5.5),
            fileName: 'test.png',
            folders: createMockFolders(),
            size: createMockSize(),
            testContext: createTestContext(),
        })

        const writtenData = JSON.parse((writeFileSync as any).mock.calls[0][1])
        expect(writtenData).toMatchSnapshot()
    })
})

describe('createJsonReportIfNeeded', () => {
    const createMockData = (misMatchPercentage = 0): CompareData => ({
        misMatchPercentage,
        rawMisMatchPercentage: misMatchPercentage,
        getBuffer: () => Buffer.from(''),
        diffBounds: { top: 0, left: 0, bottom: 0, right: 0 },
        analysisTime: 0,
        diffPixels: [],
    })
    const createMockBoundingBoxes = () => ({
        diffBoundingBoxes: [] as BoundingBox[],
        ignoredBoxes: [] as IgnoreBoxes[],
    })
    const createTestContext = (options: {
        app?: string;
        browser?: { name: string; version: string };
        deviceName?: string;
        isIOS?: boolean;
        isAndroid?: boolean;
        isMobile?: boolean;
        platform?: { name: string; version: string };
    } = {}) => ({
        commandName: 'test-command',
        instanceData: {
            app: options.app ?? 'not-known',
            browser: options.browser ?? { name: 'chrome', version: '100' },
            deviceName: options.deviceName ?? 'desktop',
            isIOS: options.isIOS ?? false,
            isAndroid: options.isAndroid ?? false,
            isMobile: options.isMobile ?? false,
            platform: options.platform ?? { name: 'windows', version: '10' },
        },
        framework: 'wdio',
        parent: 'test parent',
        tag: 'test-tag',
        title: 'test title',
    })
    const createMockFilePaths = () => ({
        actualFolderPath: '/actual',
        baselineFolderPath: '/baseline',
        diffFolderPath: '/diff',
        actualFilePath: '/actual/test.png',
        baselineFilePath: '/baseline/test.png',
        diffFilePath: '/diff/test.png',
    })
    const createMockImageCompareOptions = (createJsonReportFiles = false) => ({
        createJsonReportFiles,
        returnEarlyOnMismatch: false,
        scaleToSameSize: false,
        globalCompareOptions: {},
        localCompareOptions: {},
        diffPixelBoundingBoxProximity: 0,
        output: {
            actualScreenshotRelatedPath: '',
            baselineScreenshotRelatedPath: '',
            diffScreenshotRelatedPath: '',
            screenshotFolderOptions: {
                baselineImagesFolderName: '',
                actualImagesFolderName: '',
                diffImagesFolderName: '',
            },
        },
    })
    const createMockBase64Data = () => 'base64-image-data'

    beforeEach(() => {
        vi.clearAllMocks()
        vi.mocked(readFileSync).mockReturnValue(Buffer.from(createMockBase64Data()))
        vi.mocked(getBase64ScreenshotSize).mockReturnValue({ width: 100, height: 100 })
    })

    it('should not create report when createJsonReportFiles is false', async () => {
        await createJsonReportIfNeeded({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            filePaths: createMockFilePaths(),
            devicePixelRatio: 1,
            imageCompareOptions: createMockImageCompareOptions(false),
            testContext: createTestContext(),
            storeDiffs: true,
        })

        expect(vi.mocked(readFileSync).mock.calls).toMatchSnapshot()
        expect(vi.mocked(getBase64ScreenshotSize).mock.calls).toMatchSnapshot()
    })

    it('should create report when createJsonReportFiles is true without diff', async () => {
        await createJsonReportIfNeeded({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            filePaths: createMockFilePaths(),
            devicePixelRatio: 2,
            imageCompareOptions: createMockImageCompareOptions(true),
            testContext: createTestContext(),
            storeDiffs: false,
        })

        expect(vi.mocked(readFileSync).mock.calls).toMatchSnapshot()
        expect(vi.mocked(getBase64ScreenshotSize).mock.calls).toMatchSnapshot()
    })

    it('should create report when createJsonReportFiles is true with diff', async () => {
        await createJsonReportIfNeeded({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            filePaths: createMockFilePaths(),
            devicePixelRatio: 1,
            imageCompareOptions: createMockImageCompareOptions(true),
            testContext: createTestContext(),
            storeDiffs: true,
        })

        expect(vi.mocked(readFileSync).mock.calls).toMatchSnapshot()
        expect(vi.mocked(getBase64ScreenshotSize).mock.calls).toMatchSnapshot()
    })

    it('should create report without diff when diffFilePath is undefined', async () => {
        const filePathsWithoutDiff = {
            ...createMockFilePaths(),
            diffFilePath: undefined as unknown as string,
        }

        await createJsonReportIfNeeded({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            filePaths: filePathsWithoutDiff,
            devicePixelRatio: 1,
            imageCompareOptions: createMockImageCompareOptions(true),
            testContext: createTestContext(),
            storeDiffs: true,
        })

        expect(vi.mocked(readFileSync).mock.calls).toMatchSnapshot()
        expect(vi.mocked(getBase64ScreenshotSize).mock.calls).toMatchSnapshot()
    })
})
