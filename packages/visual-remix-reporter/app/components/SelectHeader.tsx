'use client'

import type { MultiValue, SingleValue, StylesConfig } from 'react-select'
import { components } from 'react-select'
import Select from 'react-select'
import type {
    OptionType,
    SelectedOptions,
    SnapshotInstanceData,
} from '../types'
import SelectCustomPlaceholder from './SelectCustomPlaceholder'
import SelectCustomMultiValueContainer from './SelectCustomMultiValueContainer'
import styles from './SelectHeader.module.css'

const SelectHeader = ({
    handleSelectedOptions,
    instanceData,
}: {
  handleSelectedOptions: (
    selectedOptions: string[] | keyof SelectedOptions | string,
    type: string
  ) => void;
  instanceData: SnapshotInstanceData;
    }) => {
    const appOptions = instanceData?.app
        ? instanceData.app.map((instance: string) => ({
            value: instance,
            label: instance,
        }))
        : []
    const browserOptions = instanceData?.browser
        ? instanceData.browser.map(
            (instance: { name: string; version: string }) => ({
                value: `${instance.name}-${instance.version}`,
                label: `${
                    instance.name.charAt(0).toUpperCase() + instance.name.slice(1)
                } ${instance.version}`,
            })
        )
        : []
    const deviceNameOptions = instanceData?.deviceName
        ? instanceData.deviceName.map((instance: string) => ({
            value: instance,
            label: instance.charAt(0).toUpperCase() + instance.slice(1),
        }))
        : []
    const platformOptions = instanceData?.platform
        ? instanceData.platform.map(
            (instance: { name: string; version: string }) => ({
                value: `${instance.name}-${instance.version}`,
                label: `${
                    instance.name.charAt(0).toUpperCase() + instance.name.slice(1)
                } ${instance.version}`,
            })
        )
        : []
    const selectStyles: StylesConfig<OptionType, true> = {
        control: (originalStyles) => ({
            ...originalStyles,
            borderColor: 'rgba(var(--foreground-rgb), 0.5)',
            backgroundColor: 'var(--select-background)',
            width: '100%',
        }),
        menu: (originalStyles) => ({
            ...originalStyles,
            backgroundColor: 'var(--select-background)',
            borderColor: 'rgba(var(--foreground-rgb), 0.5)',
        }),
        option: (originalStyles, state) => ({
            ...originalStyles,
            backgroundColor: state.isFocused
                ? 'transparent'
                : state.isSelected
                    ? 'var(--white)'
                    : originalStyles.backgroundColor,
            color: state.isFocused
                ? 'inherit'
                : state.isSelected
                    ? 'var(--black)'
                    : originalStyles.color,
            ':active': {
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
            },
            ':hover': {
                backgroundColor: 'var(--white)',
                color: 'var(--black)',
            },
        }),
        singleValue: (originalStyles) => ({
            ...originalStyles,
            color: 'var(--foreground-rgb)',
        }),
    }

    return (
        <div className={styles.container}>
            <Select
                components={{
                    Placeholder: (props) => (
                        <SelectCustomPlaceholder {...props} iconName="status" />
                    ),
                    Input: (props) => (
                        <components.Input {...props} aria-activedescendant={undefined} />
                    ),
                }}
                // @ts-ignore
                onChange={(selectedOption: SingleValue<OptionType>) =>
                    handleSelectedOptions(
                        selectedOption ? selectedOption.value : 'all',
                        'status'
                    )
                }
                placeholder="Status"
                options={[
                    { value: 'all', label: 'All' },
                    { value: 'passed', label: 'Passed' },
                    { value: 'failed', label: 'Failed' },
                ]}
                styles={selectStyles}
                instanceId="status"
            />
            {appOptions.length > 0 && (
                <Select
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props) => (
                            <SelectCustomPlaceholder {...props} iconName="app" />
                        ),
                        Input: (props) => (
                            <components.Input {...props} aria-activedescendant={undefined} />
                        ),
                    }}
                    isMulti
                    onChange={(selectedOptions: MultiValue<OptionType>) =>
                        handleSelectedOptions(
                            selectedOptions
                                ? selectedOptions.map((option) => option.value)
                                : [],
                            'app'
                        )
                    }
                    placeholder="Apps"
                    options={appOptions}
                    styles={selectStyles}
                    instanceId="apps"
                />
            )}
            {browserOptions.length > 0 && (
                <Select
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props) => (
                            <SelectCustomPlaceholder {...props} iconName="browser" />
                        ),
                        Input: (props) => (
                            <components.Input {...props} aria-activedescendant={undefined} />
                        ),
                    }}
                    hideSelectedOptions={false}
                    isMulti
                    onChange={(selectedOptions: MultiValue<OptionType>) =>
                        handleSelectedOptions(
                            selectedOptions
                                ? selectedOptions.map((option) => option.value)
                                : [],
                            'browser'
                        )
                    }
                    placeholder="Browsers"
                    options={browserOptions}
                    styles={selectStyles}
                    instanceId="browsers"
                />
            )}
            {deviceNameOptions.length > 0 && (
                <Select
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props) => (
                            <SelectCustomPlaceholder {...props} iconName="device" />
                        ),
                        Input: (props) => (
                            <components.Input {...props} aria-activedescendant={undefined} />
                        ),
                    }}
                    isMulti
                    onChange={(selectedOptions: MultiValue<OptionType>) =>
                        handleSelectedOptions(
                            selectedOptions
                                ? selectedOptions.map((option) => option.value)
                                : [],
                            'device'
                        )
                    }
                    placeholder="Devices"
                    options={deviceNameOptions}
                    styles={selectStyles}
                    instanceId="devices"
                />
            )}
            {platformOptions.length > 0 && (
                <Select
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props) => (
                            <SelectCustomPlaceholder {...props} iconName="platform" />
                        ),
                        Input: (props) => (
                            <components.Input {...props} aria-activedescendant={undefined} />
                        ),
                    }}
                    isMulti
                    onChange={(selectedOptions: MultiValue<OptionType>) =>
                        handleSelectedOptions(
                            selectedOptions
                                ? selectedOptions.map((option) => option.value)
                                : [],
                            'platform'
                        )
                    }
                    placeholder="OS"
                    options={platformOptions}
                    styles={selectStyles}
                    instanceId="platform"
                />
            )}
        </div>
    )
}

export default SelectHeader
