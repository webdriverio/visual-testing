'use client'

import React, { useState, useEffect } from 'react'
import Description from './components/Description'
import GetSnapshotData from './hooks/getSnapshotData'
import type { SelectedOptions, SnapshotInstanceData } from './types'
import UseFilteredDescriptionData from './hooks/filterSnapshotData'
import Header from './components/Header'
import LoadingContainer from './components/LoadingContainer'
import styles from './page.module.css'

const Home: React.FC = () => {
    const [selectedOptions, setSelectedOptions] = useState<SelectedOptions>({
        app: [],
        browser: [],
        device: [],
        platform: [],
        status: 'all',
    })
    const [loading, setLoading] = useState(true)
    const { descriptionData, error, instanceData } = GetSnapshotData()
    const handleSelectedOptions = (
        selectedOptions: string[] | keyof SelectedOptions,
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

    useEffect(() => {
        if (descriptionData.length > 0 || error) {
            setLoading(false)
        }
    }, [descriptionData, error])

    return (
        <div className={styles.main}>
            {loading ? (
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

export default Home
