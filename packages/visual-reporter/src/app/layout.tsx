import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
    title: 'Visual HTML Reporter',
    description:
    'A Visual HTML Reporter for the WebdriverIO Visual Testing Module',
}

export default function RootLayout({
    children,
}: Readonly<{
  children: React.ReactNode;
}>) {
    return (
        <html lang="en">
            <body>{children}</body>
        </html>
    )
}
