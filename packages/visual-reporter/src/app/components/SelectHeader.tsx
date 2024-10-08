'use client'

import dynamic from 'next/dynamic'
import React from 'react'
import type { StylesConfig } from 'react-select'
import type {
    OptionType,
    SelectCustomPlaceholderProps,
    SelectedOptions,
    SnapshotInstanceData,
} from '../types'
import SelectCustomPlaceholder from './SelectCustomPlaceholder'
import SelectCustomMultiValueContainer from './SelectCustomMultiValueContainer'
import styles from './SelectHeader.module.css'

const SelectNoSSR = dynamic(() => import('react-select'), {
    ssr: false,
}) as React.ComponentType<any>
const SelectHeader = ({
    handleSelectedOptions,
    instanceData,
}: {
  handleSelectedOptions: (
    selectedOptions: string[] | keyof SelectedOptions,
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
            <SelectNoSSR
                components={{
                    Placeholder: (props: SelectCustomPlaceholderProps) => (
                        <SelectCustomPlaceholder {...props} iconName="status" />
                    ),
                }}
                onChange={(selectedOption: OptionType | null) =>
                    handleSelectedOptions(
                        // @ts-ignore
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
            />
            {appOptions.length > 0 && (
                <SelectNoSSR
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props: SelectCustomPlaceholderProps) => (
                            <SelectCustomPlaceholder {...props} iconName="app" />
                        ),
                    }}
                    isMulti
                    onChange={(selectedOptions: OptionType[] | null) =>
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
                />
            )}
            {browserOptions.length > 0 && (
                <SelectNoSSR
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props: SelectCustomPlaceholderProps) => (
                            <SelectCustomPlaceholder {...props} iconName="browser" />
                        ),
                    }}
                    hideSelectedOptions={false}
                    isMulti
                    onChange={(selectedOptions: OptionType[] | null) =>
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
                />
            )}
            {deviceNameOptions.length > 0 && (
                <SelectNoSSR
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props: SelectCustomPlaceholderProps) => (
                            <SelectCustomPlaceholder {...props} iconName="device" />
                        ),
                    }}
                    isMulti
                    onChange={(selectedOptions: OptionType[] | null) =>
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
                />
            )}
            {platformOptions.length > 0 && (
                <SelectNoSSR
                    components={{
                        MultiValueContainer: SelectCustomMultiValueContainer,
                        Placeholder: (props: SelectCustomPlaceholderProps) => (
                            <SelectCustomPlaceholder {...props} iconName="platform" />
                        ),
                    }}
                    isMulti
                    onChange={(selectedOptions: OptionType[] | null) =>
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
                />
            )}
        </div>
    )
}

export default SelectHeader
