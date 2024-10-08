import { useEffect, useRef, useState } from 'react'
import type { DescriptionData, SnapshotInstanceData } from '../types'
// This is done because NextJS can't handle ESLINT flat configs yet

import { sortSnapshotData } from '../utils/sortSnapshotData'

const GetSnapshotData = () => {
    const [descriptionData, setDescriptionData] = useState<DescriptionData[]>([])
    const [instanceData, setInstanceData] = useState<SnapshotInstanceData>()
    const [error, setError] = useState<string | null>(null)
    const hasFetchedData = useRef(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                // @TODO: Fix this
                // For some reason this data url needs to here, otherwise it will not work in combination with the route
                // and it will not pick up the correct output.json file that is being passed in as a env variable
                // This also only happens during build and serve time and is a temporary fix and needs to be done properly
                const response = await fetch('/api/data?outputPath=string}')
                if (!response.ok) {
                    throw new Error('Failed to fetch data')
                }
                const jsonData: DescriptionData[] = await response.json()
                const sortedData = sortSnapshotData(jsonData)
                setDescriptionData(sortedData.descriptionData)
                setInstanceData(sortedData.instanceData)
            } catch (err) {
                console.error('Error fetching data:', err)
                if (err instanceof Error) {
                    setError(err.message)
                } else {
                    setError('An unexpected error occurred')
                }
            }
        }

        if (!hasFetchedData.current) {
            fetchData()
            hasFetchedData.current = true
        }
    }, [])

    return { descriptionData, error, instanceData }
}

export default GetSnapshotData
