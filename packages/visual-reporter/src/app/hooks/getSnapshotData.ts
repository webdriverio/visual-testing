import { useEffect, useRef, useState } from 'react'
import type { DescriptionData, SnapshotInstanceData } from '../types'
// This is done because NextJS can't handle ESLINT flat configs yet
// eslint-disable-next-line import/extensions
import { sortSnapshotData } from '../utils/sortSnapshotData'

const GetSnapshotData = (outputJsonPath: string) => {
    const [descriptionData, setDescriptionData] = useState<DescriptionData[]>([])
    const [instanceData, setInstanceData] = useState<SnapshotInstanceData>()
    const [error, setError] = useState<string | null>(null)
    const hasFetchedData = useRef(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch(
                    `/api/data?outputPath=${encodeURIComponent(outputJsonPath)}`
                )
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
    }, [outputJsonPath])

    return { descriptionData, error, instanceData }
}

export default GetSnapshotData
