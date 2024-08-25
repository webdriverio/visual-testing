import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import type { DescriptionData } from '../../types'

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get('outputPath')

    if (!filePath) {
        return NextResponse.json(
            { error: 'outputPath query parameter is required' },
            { status: 400 }
        )
    }

    try {
        const jsonData: DescriptionData[] = JSON.parse(
            fs.readFileSync(filePath, 'utf-8')
        )
        return NextResponse.json(jsonData, { status: 200 })
    } catch (error) {
        console.error('Failed to read data:', error)
        return NextResponse.json({ error: 'Failed to read data' }, { status: 500 })
    }
}
