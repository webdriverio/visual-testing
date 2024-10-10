
import { useState } from 'react'
import Description from '~/components/Description'
import Header from '~/components/Header'
import LoadingContainer from '~/components/LoadingContainer'
import UseFilteredDescriptionData from '~/hooks/filterSnapshotData'
import styles from '~/styles/index.module.css'
import type { SelectedOptions, SnapshotInstanceData } from '~/types'
import GetSnapshotData from '~/hooks/getSnapshotData'

const Index = () => {
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
        app: [],
        browser: [],
        device: [],
        platform: [],
        status: 'all',
    })
    const { descriptionData, error, instanceData } = GetSnapshotData()
    const handleSelectedOptions = (
        selectedOptions: string[] | keyof SelectedOptions | string,
        type: keyof typeof selectedOptions | string
    ) => {
        setSelectedOptions((prev) => ({
            ...prev,
            [type]: selectedOptions,
        }))
    }
    const filteredDescriptionData = UseFilteredDescriptionData(
        descriptionData,
        selectedOptions
    )
    const isLoading = descriptionData.length === 0 && !error

    return (
        <div className={styles.main}>
            {isLoading ? (
                <div className={styles.container}>
                    <LoadingContainer />
                </div>
            ) : error ? (
                <p className={styles.error}>{error}</p>
            ) : (
                <>
                    <Header
                        handleSelectedOptions={handleSelectedOptions}
                        instanceData={instanceData as SnapshotInstanceData}
                    />
                    <div className={styles.container}>
                        <div>
                            {filteredDescriptionData.map((item, index) => (
                                <Description
                                    data={item.data}
                                    description={item.description}
                                    key={index}
                                />
                            ))}
                        </div>
                    </div>
                </>
            )}
        </div>
    )
}

export default Index
