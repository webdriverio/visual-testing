'use client'

import React, { useEffect, useState } from 'react'
import type { MethodData } from '../types'
import MethodItem from './MethodItem'
import styles from './Test.module.css'

interface TestProps {
  test: string;
  data: MethodData[];
}

const Test: React.FC<TestProps> = ({ test, data }) => {
    const [isOpen, setIsOpen] = useState(false)

    useEffect(() => {
        const hasMismatch = data.some(
            (test) => parseFloat(test.misMatchPercentage) > 0
        )
        if (hasMismatch) {
            setIsOpen(true)
        }
    }, [data])

    return (
        <div className={styles.test}>
            <h3 onClick={() => setIsOpen(!isOpen)} className={styles.testTitle}>
                <span className={`chevron ${isOpen ? 'open' : ''}`} />
                {test}
            </h3>
            {isOpen && (
                <div className={styles.grid}>
                    {data.map((methodItem, index) => (
                        <MethodItem key={index} data={methodItem} />
                    ))}
                </div>
            )}
        </div>
    )
}

export default Test
