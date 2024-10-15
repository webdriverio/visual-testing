import { useMemo } from 'react'
import type {
    DescriptionData,
    TestData,
    MethodData,
    SelectedOptions,
} from '../types/index.js'

const UseFilteredDescriptionData = (
    descriptionData: DescriptionData[],
    selectedOptions: SelectedOptions
) => {
    const filteredDescriptionData = useMemo(() => {
        return descriptionData
            .map((item: DescriptionData) => {
                const filteredTests = item.data
                    .map((test: TestData) => {
                        const filteredMethods = test.data.filter((method: MethodData) => {
                            const appMatch =
                !selectedOptions.app.length ||
                selectedOptions.app.includes(item.description)
                            const browserMatch =
                !selectedOptions.browser.length ||
                selectedOptions.browser.includes(
                    `${method.instanceData.browser?.name}-${method.instanceData.browser?.version}` ||
                    ''
                )
                            const deviceMatch =
                !selectedOptions.device.length ||
                selectedOptions.device.includes(
                    method.instanceData.deviceName || ''
                )
                            const platformMatch =
                !selectedOptions.platform.length ||
                selectedOptions.platform.includes(
                    `${method.instanceData.platform.name}-${method.instanceData.platform.version}` ||
                    ''
                )
                            const statusMatch =
                selectedOptions.status === 'all' ||
                (selectedOptions.status === 'passed' &&
                  parseFloat(method.misMatchPercentage) === 0) ||
                (selectedOptions.status === 'failed' &&
                  parseFloat(method.misMatchPercentage) > 0)

                            return (
                                appMatch &&
                browserMatch &&
                deviceMatch &&
                platformMatch &&
                statusMatch
                            )
                        })

                        return { ...test, data: filteredMethods }
                    })
                    .filter((test) => test.data.length > 0)

                return { ...item, data: filteredTests }
            })
            .filter((item) => item.data.length > 0)
    }, [descriptionData, selectedOptions])

    return filteredDescriptionData
}

export default UseFilteredDescriptionData
