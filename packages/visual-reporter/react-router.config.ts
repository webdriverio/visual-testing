import type { Config } from '@react-router/dev/config'

const baseName = process.env.GITHUB_PAGES || ''

export default {
    // The report is a static single-page app: the CLI copies build/client and serves it
    ssr: false,
    ...(baseName && { basename: baseName }),
} satisfies Config
