import {
    FaAndroid,
    FaApple,
    FaDesktop,
    FaLinux,
    FaWindows,
} from 'react-icons/fa6'
import { FaQuestionCircle } from 'react-icons/fa'
import React from 'react'

export type PlatformName = 'android' | 'ios' | 'linux' | 'osx' | 'windows';

const platformIcons: Record<
  PlatformName,
  React.ComponentType<React.ComponentProps<'svg'>>
> = {
    android: FaAndroid,
    ios: FaApple,
    linux: FaLinux,
    osx: FaDesktop,
    windows: FaWindows,
}

interface AllowedIconProps {
  color?: string;
  size?: string | number;
  className?: string;
  style?: React.CSSProperties;
}

const normalizePlatformName = (name: string): PlatformName | undefined => {
    const lowercasedName = name.toLowerCase()

    if (lowercasedName.includes('android')) {return 'android'}
    if (lowercasedName.includes('ios')) {return 'ios'}
    if (lowercasedName.includes('linux')) {return 'linux'}
    if (lowercasedName.includes('osx')) {return 'osx'}
    if (lowercasedName.includes('mac')) {return 'osx'}
    if (lowercasedName.includes('windows')) {return 'windows'}

    return undefined
}

interface PlatformIconProps
  extends AllowedIconProps,
    React.ComponentProps<'svg'> {
  platformName: string;
}

const PlatformIcon: React.FC<PlatformIconProps> = ({
    platformName,
    ...props
}) => {
    const normalizedBrowserName = normalizePlatformName(platformName)
    const IconComponent = normalizedBrowserName
        ? platformIcons[normalizedBrowserName]
        : FaQuestionCircle

    return <IconComponent {...props} />
}

export default PlatformIcon
