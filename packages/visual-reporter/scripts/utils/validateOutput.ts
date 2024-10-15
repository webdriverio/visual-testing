import type {
    BoundingBox,
    BoundingBoxes,
    DescriptionData,
    FileData,
    IgnoreBoxes,
    ImageSize,
    InstanceData,
    MethodData,
    TestData,
} from '../types.js'

export function validateOutputJson(data: DescriptionData[]) {
    if (!Array.isArray(data)) {return false}

    return data.every((descriptionData) => {
        return (
            typeof descriptionData.description === 'string' &&
            Array.isArray(descriptionData.data) &&
            descriptionData.data.every(isValidTestData)
        )
    })
}

function isValidTestData(testData: TestData) {
    return (
        typeof testData.test === 'string' &&
        Array.isArray(testData.data) &&
        testData.data.every(isValidMethodData)
    )
}

function isValidMethodData(methodData: MethodData) {
    return (
        typeof methodData.description === 'string' &&
        typeof methodData.test === 'string' &&
        typeof methodData.tag === 'string' &&
        typeof methodData.commandName === 'string' &&
        typeof methodData.framework === 'string' &&
        typeof methodData.misMatchPercentage === 'string' &&
        typeof methodData.rawMisMatchPercentage === 'number' &&
        isValidInstanceData(methodData.instanceData) &&
        isValidBoundingBoxes(methodData.boundingBoxes) &&
        isValidFileData(methodData.fileData)
    )
}

function isValidInstanceData(instanceData: InstanceData) {
    return (
        typeof instanceData === 'object' &&
        instanceData !== null &&
        (typeof instanceData.app === 'string' ||
            (typeof instanceData.browser === 'object' &&
            typeof instanceData.browser.name === 'string' &&
            typeof instanceData.browser.version === 'string') ||
        typeof instanceData.deviceName === 'string') &&
        typeof instanceData.platform === 'object' &&
        typeof instanceData.platform.name === 'string' &&
        typeof instanceData.platform.version === 'string'
    )
}

function isValidBoundingBoxes(boundingBoxes: BoundingBoxes) {
    return (
        boundingBoxes &&
        Array.isArray(boundingBoxes.diffBoundingBoxes) &&
        Array.isArray(boundingBoxes.ignoredBoxes) &&
        boundingBoxes.diffBoundingBoxes.every(isValidBoundingBox) &&
        boundingBoxes.ignoredBoxes.every(isValidIgnoreBox)
    )
}

function isValidBoundingBox(boundingBox: BoundingBox) {
    return (
        typeof boundingBox.bottom === 'number' &&
        typeof boundingBox.right === 'number' &&
        typeof boundingBox.left === 'number' &&
        typeof boundingBox.top === 'number'
    )
}

function isValidIgnoreBox(ignoreBox: IgnoreBoxes) {
    return isValidBoundingBox(ignoreBox)
}

function isValidFileData(fileData: FileData) {
    return (
        typeof fileData.actualFilePath === 'string' &&
        typeof fileData.baselineFilePath === 'string' &&
        (typeof fileData.diffFilePath === 'string' || fileData.diffFilePath === undefined) &&
        typeof fileData.fileName === 'string' &&
        typeof fileData.size === 'object' &&
        isValidSize(fileData.size.actual) &&
        isValidSize(fileData.size.baseline) &&
        (!fileData.size.diff || isValidSize(fileData.size.diff))
    )
}

function isValidSize(size: ImageSize) {
    return typeof size.width === 'number' && typeof size.height === 'number'
}
