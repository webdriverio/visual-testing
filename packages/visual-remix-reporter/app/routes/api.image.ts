import { json } from '@remix-run/node'
import type { LoaderFunction } from '@remix-run/node'
import fs from 'node:fs'

export const loader: LoaderFunction = async ({ request }) => {
    const url = new URL(request.url)
    const filePath = url.searchParams.get('filePath')

    if (!filePath) {
        return json({ error: 'File path is required' }, { status: 400 })
    }

    const decodedFilePath = decodeURIComponent(filePath)

    if (!fs.existsSync(decodedFilePath)) {
        return json({ error: 'File not found' }, { status: 404 })
    }

    const fileBuffer = fs.readFileSync(decodedFilePath)
    const contentType = decodedFilePath.endsWith('.png')
        ? 'image/png'
        : decodedFilePath.endsWith('.jpg') || decodedFilePath.endsWith('.jpeg')
            ? 'image/jpeg'
            : 'application/octet-stream'

    return new Response(fileBuffer, {
        status: 200,
        headers: {
            'Content-Type': contentType,
        },
    })
}
