import type { ResultReport } from 'webdriver-image-comparison'

export const jsonFileContent: ResultReport[] = [
    // To cover platform.name differences
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd1',
        framework: '',
        instanceData: {
            platform: { name: 'platform2', version: 'v1' },
            browser: { name: 'browser1', version: '' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd1',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: { name: 'browser1', version: '' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },

    // To cover browser name differences, including missing and undefined names
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd2',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: { name: 'browser2', version: '' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd2',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            // @ts-ignore
            browser: {} // Browser with no name
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd2',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            // @ts-ignore
            browser: null // Browser is null
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd2',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: undefined // Browser is undefined
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },

    // To cover device name differences and return 0 scenarios
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd3',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: { name: 'browser1', version: '' },
            deviceName: 'device2'
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test1',
        tag: '',
        commandName: 'cmd3',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: { name: 'browser1', version: '' },
            deviceName: 'device1'
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },

    // Additional cases for thorough coverage
    {
        description: '@wdio/visual-service mobile web',
        test: 'test2',
        tag: '',
        commandName: 'cmd1',
        framework: '',
        instanceData: {
            platform: { name: 'platform3', version: 'v1' },
            browser: { name: 'browser1', version: '' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test2',
        tag: '',
        commandName: 'cmd1',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: { name: 'browser1', version: '' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test2',
        tag: '',
        commandName: 'cmd2',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: { name: 'browser2', version: '' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test2',
        tag: '',
        commandName: 'cmd2',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' },
            browser: { name: '', version: '' } // Empty browser name
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test2',
        tag: '',
        commandName: 'cmd3',
        framework: '',
        instanceData: {
            platform: { name: 'platform2', version: 'v1' },
            browser: { name: 'browser3', version: '' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    },
    {
        description: '@wdio/visual-service mobile web',
        test: 'test2',
        tag: '',
        commandName: 'cmd3',
        framework: '',
        instanceData: {
            platform: { name: 'platform1', version: 'v1' }
        },
        boundingBoxes: { diffBoundingBoxes: [], ignoredBoxes: [] },
        fileData: {
            actualFilePath: '',
            baselineFilePath: '',
            diffFilePath: '',
            fileName: '',
            size: { actual: { width: 0, height: 0 }, baseline: { width: 0, height: 0 }, diff: { width: 0, height: 0 } }
        },
        misMatchPercentage: '0',
        rawMisMatchPercentage: 0
    }
]
