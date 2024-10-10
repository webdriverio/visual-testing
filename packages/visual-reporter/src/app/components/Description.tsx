'use client'

import React, { useState, useEffect } from 'react'
import Test from './Test'
import styles from './Description.module.css'
import type { TestData } from '../types'

interface DescriptionProps {
  description: string;
  data: TestData[];
}

const Description: React.FC<DescriptionProps> = ({ description, data }) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasMismatch = data.some((test) =>
            test.data.some((method) => parseFloat(method.misMatchPercentage) > 0)
        )
        if (hasMismatch) {
            setIsOpen(true)
        }
    }, [data])

    return (
        <div className={styles.description}>
            <h2
                onClick={() => setIsOpen(!isOpen)}
                className={styles.descriptionTitle}
            >
                <span className={`chevron ${isOpen ? 'open' : ''}`} />
                {description}
            </h2>
            {isOpen && (
                <div className={styles.descriptionContainer}>
                    {data.map((testItem, index) => (
                        <Test key={index} test={testItem.test} data={testItem.data} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Description
