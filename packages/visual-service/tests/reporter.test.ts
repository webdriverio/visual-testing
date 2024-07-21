import { describe, it, expect, vi, beforeEach } from 'vitest'
import fs from 'node:fs'
import path from 'node:path'
import { join } from 'node:path'
import VisualReportGenerator from '../src/reporter.js'

vi.mock('fs')
// vi.mock('path')
vi.mock('@wdio/logger', () => import(join(process.cwd(), '__mocks__', '@wdio/logger')))

describe('VisualReportGenerator class', () => {
    const mockDirectoryPath = '/mock-directory'
    let visualReporter: VisualReportGenerator

    beforeEach(() => {
        visualReporter = new VisualReportGenerator({ directoryPath: mockDirectoryPath })
    })

    it('should call readDirectory when calling readJsonFilesRecursively', () => {
        const mockTestData: any[] = [{ '@wdio/visual-service mobile web': { test: 'test1', commandName: 'cmd', instanceData: { platform: { name: 'platform', version: 'v1' } } } }]
        const readDirectorySpy = vi.spyOn(visualReporter as any, 'readDirectory').mockImplementation((dir, testData:any) => {
            testData.push(mockTestData[0])
        })
        // We cast it to any to also test the private method
        const result = (visualReporter as any).readJsonFilesRecursively(mockDirectoryPath)

        expect(readDirectorySpy).toHaveBeenCalledWith(mockDirectoryPath, expect.any(Array))
        expect(result).toEqual(mockTestData)
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
})
