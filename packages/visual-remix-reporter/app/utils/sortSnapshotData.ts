import type {
    DescriptionData,
    SnapshotData,
    SnapshotInstanceData,
    InstanceData,
    MethodData,
    BoundingBox,
} from '../types'

function addUnique<T>(set: Set<T>, item: T | undefined): void {
    if (item !== undefined && item !== null) {
        set.add(item)
    }
}

function sortBoundingBoxes(boxA: BoundingBox, boxB: BoundingBox): number {
    if (boxA.top !== boxB.top) {
        return boxA.top - boxB.top
    }

    return boxA.left - boxB.left
}

function processMethodData(method: MethodData): MethodData {
    method.boundingBoxes.diffBoundingBoxes.sort(sortBoundingBoxes)

    return method
}

function sortMethods(methodA: MethodData, methodB: MethodData): number {
    const hasMismatchA = parseFloat(methodA.misMatchPercentage) > 0
    const hasMismatchB = parseFloat(methodB.misMatchPercentage) > 0

    if (hasMismatchA && !hasMismatchB) {return -1}
    if (!hasMismatchA && hasMismatchB) {return 1}

    const testCompare = methodA.test.localeCompare(methodB.test)
    if (testCompare !== 0) {return testCompare}

    const platformCompare = methodA.instanceData.platform.name.localeCompare(
        methodB.instanceData.platform.name
    )
    if (platformCompare !== 0) {return platformCompare}

    const platformVersionA = methodA.instanceData.platform.version || ''
    const platformVersionB = methodB.instanceData.platform.version || ''
    const platformVersionCompare =
    platformVersionA.localeCompare(platformVersionB)
    if (platformVersionCompare !== 0) {return platformVersionCompare}

    const browserNameA = methodA.instanceData.browser?.name || ''
    const browserNameB = methodB.instanceData.browser?.name || ''
    const browserCompare = browserNameA.localeCompare(browserNameB)
    if (browserCompare !== 0) {return browserCompare}

    const browserVersionA = methodA.instanceData.browser?.version || ''
    const browserVersionB = methodB.instanceData.browser?.version || ''
    const browserVersionCompare = browserVersionA.localeCompare(browserVersionB)
    if (browserVersionCompare !== 0) {return browserVersionCompare}

    const appCompare = (methodA.instanceData.app || '').localeCompare(
        methodB.instanceData.app || ''
    )
    return appCompare
}

function sortDescriptionData(jsonData: DescriptionData[]): DescriptionData[] {
    return jsonData
        .sort((a, b) => a.description.localeCompare(b.description))
        .map((description) => ({
            ...description,
            data: description.data.map((test) => ({
                ...test,
                data: test.data.map(processMethodData).sort(sortMethods),
            })),
        }))
}

function compareVersions(versionA: string, versionB: string): number {
    const partsA = versionA.split('.').map(Number)
    const partsB = versionB.split('.').map(Number)

    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
        const numA = partsA[i] || 0
        const numB = partsB[i] || 0

        if (numA !== numB) {
            return numB - numA
        }
    }
    return 0
}

function collectUniqueInstanceData(
    sortedData: DescriptionData[]
): SnapshotInstanceData {
    const apps = new Set<string>()
    const browserCombinations = new Set<string>()
    const deviceNames = new Set<string>()
    const platformCombinations = new Set<string>()

    sortedData.forEach((description) => {
        description.data.forEach((test) => {
            test.data.forEach((method) => {
                const instance: InstanceData = method.instanceData
                addUnique(apps, instance.app)

                if (instance.browser) {
                    const browserKey = `${instance.browser.name} ${instance.browser.version}`
                    addUnique(browserCombinations, browserKey)
                }

                addUnique(deviceNames, instance.deviceName)

                const platformKey = `${instance.platform.name} ${instance.platform.version}`
                addUnique(platformCombinations, platformKey)
            })
        })
    })

    return {
        app: Array.from(apps),
        browser: Array.from(browserCombinations)
            .map((combo) => {
                const [name, ...versionParts] = combo.split(' ')
                const version = versionParts.join(' ')
                return { name, version }
            })
            .sort((a, b) => {
                const nameCompare = a.name.localeCompare(b.name)
                if (nameCompare !== 0) {return nameCompare}
                return compareVersions(a.version, b.version)
            }),
        deviceName: Array.from(deviceNames),
        platform: Array.from(platformCombinations)
            .map((combo) => {
                const [name, ...versionParts] = combo.split(' ')
                const version = versionParts.join(' ')
                return { name, version }
            })
            .sort((a, b) => {
                const nameCompare = a.name.localeCompare(b.name)
                if (nameCompare !== 0) {return nameCompare}
                return compareVersions(a.version, b.version)
            }),
    }
}

export const sortSnapshotData = (jsonData: DescriptionData[]): SnapshotData => {
    const sortedData = sortDescriptionData(jsonData)
    const uniqueInstanceData = collectUniqueInstanceData(sortedData)

    return {
        descriptionData: sortedData,
        instanceData: uniqueInstanceData,
    }
}
