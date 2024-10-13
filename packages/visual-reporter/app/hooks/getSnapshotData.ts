import { useEffect, useRef, useState } from 'react'
import type { DescriptionData, SnapshotInstanceData } from '~/types'
import { sortSnapshotData } from '~/utils/sortSnapshotData'

const GetSnapshotData = () => {
    const [descriptionData, setDescriptionData] = useState<DescriptionData[]>([])
    const [instanceData, setInstanceData] = useState<SnapshotInstanceData>()
    const [error, setError] = useState<string | null>(null)
    const hasFetchedData = useRef(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                const basePath = import.meta.env.BASE_URL || ''
                const response = await fetch(`${basePath}static/report/output.json`)
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
