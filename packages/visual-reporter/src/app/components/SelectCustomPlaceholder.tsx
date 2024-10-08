import { components } from 'react-select'
import type {
    SelectCustomPlaceholderIconType,
    SelectCustomPlaceholderProps,
} from '../types'
import { FiCodepen, FiThumbsUp } from 'react-icons/fi'
import { PiBrowser } from 'react-icons/pi'
import { HiDevicePhoneMobile } from 'react-icons/hi2'
import { IoIosApps } from 'react-icons/io'

const SelectIcon = ({
    iconName,
}: {
  iconName: SelectCustomPlaceholderIconType;
}) => {
    switch (iconName) {
    case 'status':
        return <FiThumbsUp />
    case 'app':
        return <IoIosApps />
    case 'browser':
        return <PiBrowser />
    case 'device':
        return <HiDevicePhoneMobile />
    case 'platform':
        return <FiCodepen />
    default:
        return <span>Unknown OS</span>
    }
}

const SelectCustomPlaceholder = ({
    iconName,
    children,
    ...props
}: SelectCustomPlaceholderProps) => {
    return (
        <components.Placeholder {...props}>
            <div style={{ display: 'flex', alignItems: 'center' }}>
                <SelectIcon iconName={iconName as SelectCustomPlaceholderIconType} />
                <span style={{ marginLeft: 5 }}>{children}</span>
            </div>
        </components.Placeholder>
    )
}

export default SelectCustomPlaceholder
