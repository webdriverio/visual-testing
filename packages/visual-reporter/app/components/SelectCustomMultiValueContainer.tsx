import type { MultiValueGenericProps } from 'react-select'
import { components } from 'react-select'
import type { OptionType } from '../types/index.js'
import styles from './SelectCustomMultiValueContainer.module.css'

const MAX_DISPLAYED_BADGES = 1
const SelectCustomMultiValueContainer = (
    props: MultiValueGenericProps<OptionType, true>
) => {
    const { children, selectProps, data } = props
    const selectedValues = selectProps.value as OptionType[]
    const index = selectedValues.findIndex(
        (selectedOption) => selectedOption.value === data.value
    )

    if (index < MAX_DISPLAYED_BADGES) {
        return (
            <components.MultiValueContainer {...props}>
                <span className={styles.ellipsis}>{children}</span>
            </components.MultiValueContainer>
        )
    }

    if (index === MAX_DISPLAYED_BADGES) {
        const remainingBadgeCount = selectedValues.length - MAX_DISPLAYED_BADGES

        return <div className={styles.overflowBadge}>+{remainingBadgeCount}</div>
    }

    return null
}

export default SelectCustomMultiValueContainer
