import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import fs from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const isVercelDemo = process.env.NEXT_VERCEL_DEMO === 'true'
const vercelPath = isVercelDemo ? join(__dirname, '..', '..', '..', '..') : ''

export async function GET(req: NextRequest) {
    const { searchParams } = new URL(req.url)
    const filePath = searchParams.get('filePath')

    if (!filePath) {
        return NextResponse.json(
            { error: 'File path is required' },
            { status: 400 }
        )
    }

    const decodedFilePath = join(vercelPath, decodeURIComponent(filePath))

    if (!fs.existsSync(decodedFilePath)) {
        return NextResponse.json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(decodedFilePath)

    const contentType = decodedFilePath.endsWith('.png')
        ? 'image/png'
        : decodedFilePath.endsWith('.jpg') || decodedFilePath.endsWith('.jpeg')
            ? 'image/jpeg'
            : 'application/octet-stream'

    return new NextResponse(fileBuffer, {
        status: 200,
        headers: {
            'Content-Type': contentType,
        },
    })
}
