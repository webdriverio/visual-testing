import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { join } from 'node:path'
import logger from '@wdio/logger'
import VisualReportGenerator from '../src/reporter.js'

vi.mock('fs')
// vi.mock('path')
const log = logger('test')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('VisualReportGenerator class', () => {
    const mockDirectoryPath = '/mock-directory'
    const jsonFileContent = [
        // To cover platform.name differences
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd1', instanceData: { platform: { name: 'platform2', version: 'v1' }, browser: { name: 'browser1' } } } },
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd1', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: { name: 'browser1' } } } },

        // To cover browser name differences, including missing and undefined names
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd2', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: { name: 'browser2' } } } },
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd2', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: {} } } }, // Browser with no name
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd2', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: null } } }, // Browser is null
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd2', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: undefined } } }, // Browser is undefined

        // To cover device name differences and return 0 scenarios
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd3', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: { name: 'browser1' }, deviceName: 'device2' } } },
        { '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd3', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: { name: 'browser1' }, deviceName: 'device1' } } },

        // Additional cases for thorough coverage
        { '@wdio/visual-service mobile web': { test: 'test2', commandName: 'cmd1', instanceData: { platform: { name: 'platform3', version: 'v1' }, browser: { name: 'browser1' } } } }, // Different test name, different platform name
        { '@wdio/visual-service mobile web': { test: 'test2', commandName: 'cmd1', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: { name: 'browser1' } } } }, // Different test name, same platform name
        { '@wdio/visual-service mobile web': { test: 'test2', commandName: 'cmd2', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: { name: 'browser2' } } } }, // Same test name, same platform, different browser name
        { '@wdio/visual-service mobile web': { test: 'test2', commandName: 'cmd2', instanceData: { platform: { name: 'platform1', version: 'v1' }, browser: { name: '' } } } }, // Same test name, same platform, empty browser name
        { '@wdio/visual-service mobile web': { test: 'test2', commandName: 'cmd3', instanceData: { platform: { name: 'platform2', version: 'v1' }, browser: { name: 'browser3' } } } }, // Different test name, different platform, different browser
        { '@wdio/visual-service mobile web': { test: 'test2', commandName: 'cmd3', instanceData: { platform: { name: 'platform1', version: 'v1' } } } } // No browser or deviceName
    ]

    let visualReporter: VisualReportGenerator

    beforeEach(() => {
        visualReporter = new VisualReportGenerator({ directoryPath: mockDirectoryPath })
    })

    it('should generate a visual report', () => {
        const logSpy = vi.spyOn(log, 'info')
        const readJsonFilesRecursivelySpy = vi.spyOn(visualReporter as any, 'readJsonFilesRecursively')
            .mockReturnValue(jsonFileContent)
        const groupAndSortTestDataSpy = vi.spyOn(visualReporter as any, 'groupAndSortTestData').mockReturnValue({ grouped: 'data' })
        const writeJsonToFileSpy = vi.spyOn(visualReporter as any, 'writeJsonToFile').mockImplementation(() => {})

        visualReporter.generate()

        expect(logSpy).toHaveBeenCalledWith('Generating visual report...')
        expect(readJsonFilesRecursivelySpy).toHaveBeenCalledWith(mockDirectoryPath)
        expect(logSpy).toHaveBeenCalledWith('Read all json files')
        expect(groupAndSortTestDataSpy).toHaveBeenCalledWith(jsonFileContent)
        expect(logSpy).toHaveBeenCalledWith('Grouped and sorted data')
        expect(writeJsonToFileSpy).toHaveBeenCalledWith(join(mockDirectoryPath, 'output.json'), { grouped: 'data' })
        expect(logSpy).toHaveBeenCalledWith('Report generated')
    })

    it('should log an error if report generation fails', () => {
        const readJsonFilesRecursivelySpy = vi.spyOn(visualReporter as any, 'readJsonFilesRecursively')
            .mockImplementation(() => { throw new Error('Test Error') })
        const logSpy = vi.spyOn(log, 'error')

        visualReporter.generate()

        expect(readJsonFilesRecursivelySpy).toHaveBeenCalled()
        expect(logSpy).toHaveBeenCalledWith('Error generating visual report:', expect.any(Error))
    })

    it('should read a JSON file and populate testData array', () => {
        const mockFilePath = '/mock-directory/file-report.json'
        const mockTestData: any[] = []
        const readFileSyncSpy = vi.spyOn(fs, 'readFileSync').mockReturnValue(JSON.stringify(jsonFileContent[0]))

        ;(visualReporter as any).readJsonFile(mockFilePath, mockTestData)

        expect(readFileSyncSpy).toHaveBeenCalledWith(mockFilePath, 'utf-8')
        expect(mockTestData).toContainEqual(jsonFileContent[0])
    })

    it('should group and sort test data correctly', () => {
        const result = (visualReporter as any).groupAndSortTestData(jsonFileContent)

        expect(result).toMatchSnapshot()
    })

    it('should call readDirectory when calling readJsonFilesRecursively', () => {
        const readDirectorySpy = vi.spyOn(visualReporter as any, 'readDirectory').mockImplementation((dir, testData:any) => {
            testData.push(jsonFileContent[0])
        })
        // We cast it to any to also test the private method
        const result = (visualReporter as any).readJsonFilesRecursively(mockDirectoryPath)

        expect(readDirectorySpy).toHaveBeenCalledWith(mockDirectoryPath, expect.any(Array))
        expect(result).toEqual([jsonFileContent[0]])
    })

    it('should read a directory and populate testData array', () => {
        const testData: any[] = []
        const readdirSyncMock = vi.spyOn(fs, 'readdirSync')
            .mockImplementation((dirPath): any => {
                if (dirPath === mockDirectoryPath) {
                    return ['subdir']
                } else if (dirPath === path.join(mockDirectoryPath, 'subdir')) {
                    return ['file-report.json']
                }
                return []
            })
        const statSyncMock = vi.spyOn(fs, 'statSync')
            .mockImplementation((fullPath) => {
                return {
                    isDirectory: () => (fullPath as string).endsWith('subdir'),
                    isFile: () => (fullPath as string).includes('file-report.json'),
                } as fs.Stats
            })
        const readJsonFileSpy = vi.spyOn(visualReporter as any, 'readJsonFile')
            .mockImplementation((filePath, testData: any) => {
                testData.push({ '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd', instanceData: { platform: { name: 'platform', version: 'v1' } } } })
            })

        ;(visualReporter as any).readDirectory(mockDirectoryPath, testData)

        expect(readdirSyncMock).toHaveBeenCalledWith(mockDirectoryPath)
        expect(readdirSyncMock).toHaveBeenCalledWith(path.join(mockDirectoryPath, 'subdir'))
        expect(statSyncMock).toHaveBeenCalledWith(path.join(mockDirectoryPath, 'subdir'))
        expect(statSyncMock).toHaveBeenCalledWith(path.join(mockDirectoryPath, 'subdir', 'file-report.json'))
        expect(readJsonFileSpy).toHaveBeenCalledWith(path.join(mockDirectoryPath, 'subdir', 'file-report.json'), testData)
        expect(testData).toHaveLength(1)
    })

    it('should write JSON data to a file', () => {
        const mockFilePath = '/mock-directory/output.json'
        const mockData = { test: 'data' }

        const writeFileSyncSpy = vi.spyOn(fs, 'writeFileSync').mockImplementation(() => {})

        ;(visualReporter as any).writeJsonToFile(mockFilePath, mockData)

        expect(writeFileSyncSpy).toHaveBeenCalledWith(mockFilePath, JSON.stringify(mockData, null, 2), 'utf-8')
    })
})
