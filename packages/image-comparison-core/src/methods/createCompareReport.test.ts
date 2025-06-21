import { describe, it, expect, vi, beforeEach } from 'vitest'
import { writeFileSync } from 'node:fs'
import { createCompareReport } from './createCompareReport.js'
import type { CompareData } from '../resemble/compare.interfaces.js'
import type { BoundingBox, IgnoreBoxes } from './images.interfaces.js'
import type { BaseDimensions } from '../base.interfaces.js'

vi.mock('node:fs', () => ({
    writeFileSync: vi.fn(),
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

    const createMockFolders = (includeDiff = true) => ({
        actualFolderPath: '/actual',
        baselineFolderPath: '/baseline',
        ...(includeDiff && { diffFolderPath: '/diff' }),
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

    it('should create a report without diff file path', () => {
        createCompareReport({
            boundingBoxes: createMockBoundingBoxes(),
            data: createMockData(),
            fileName: 'test.png',
            folders: createMockFolders(false),
            size: createMockSize(),
            testContext: createTestContext(),
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
