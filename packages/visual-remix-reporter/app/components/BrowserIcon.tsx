import { FaEdge, FaSafari, FaFirefox, FaChrome } from 'react-icons/fa6'
import { FaQuestionCircle } from 'react-icons/fa'
import React from 'react'

export type BrowserName = 'chrome' | 'firefox' | 'microsoftedge' | 'safari';

const browserIcons: Record<
  BrowserName,
  React.ComponentType<React.ComponentProps<'svg'>>
> = {
    chrome: FaChrome,
    firefox: FaFirefox,
    microsoftedge: FaEdge,
    safari: FaSafari,
}

interface AllowedIconProps {
  color?: string;
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const normalizeBrowserName = (name: string): BrowserName | undefined => {
    const lowercasedName = name.toLowerCase()

    if (lowercasedName.includes('edge')) {return 'microsoftedge'}
    if (lowercasedName.includes('safari')) {return 'safari'}
    if (lowercasedName.includes('firefox')) {return 'firefox'}
    if (lowercasedName.includes('chrome')) {return 'chrome'}

    return undefined
}

interface BrowserIconProps
  extends AllowedIconProps,
    React.ComponentProps<'svg'> {
  browserName: string;
}

const BrowserIcon: React.FC<BrowserIconProps> = ({ browserName, ...props }) => {
    const normalizedBrowserName = normalizeBrowserName(browserName)
    const IconComponent = normalizedBrowserName
        ? browserIcons[normalizedBrowserName]
        : FaQuestionCircle

    return <IconComponent {...props} />
}

export default BrowserIcon
