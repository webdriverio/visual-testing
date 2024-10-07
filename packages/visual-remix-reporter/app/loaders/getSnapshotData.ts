import { json } from '@remix-run/node'
import fs from 'node:fs'
import type { LoaderFunction } from '@remix-run/node'
import type { DescriptionData, SnapshotDataLoader } from '~/types'
import { sortSnapshotData } from '~/utils/sortSnapshotData.js'

export const getSnapshotDataLoader: LoaderFunction = async () => {
    const filePath = process.env.NEXT_PUBLIC_VISUAL_REPORT_OUTPUT_JSON_PATH || 'public/static/sample/output.json'

    console.log('filePath:', filePath)

    if (!filePath) {
        return json(
            { error: 'outputPath query parameter is required' },
            { status: 400 }
        )
    }

    try {
        const jsonData: DescriptionData[] = JSON.parse(
            fs.readFileSync(filePath, 'utf-8')
        )
        const sortedData = sortSnapshotData(jsonData)
        const SnapshotData: SnapshotDataLoader = {
            descriptionData: sortedData.descriptionData,
            instanceData: sortedData.instanceData,
        }

        return json(SnapshotData)
    } catch (error) {
        console.error('Failed to read data:', error)
        return json({ error: 'Failed to read data' }, { status: 500 })
    }
}
