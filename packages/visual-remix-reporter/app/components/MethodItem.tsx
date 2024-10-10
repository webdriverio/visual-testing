import React, { useState, useEffect } from 'react'
import styles from './MethodItem.module.css'
import type { MethodData } from '../types'
import type { BrowserName } from './BrowserIcon'
import BrowserIcon from './BrowserIcon'
import type { PlatformName } from './PlatformIcon'
import PlatformIcon from './PlatformIcon'
import Overlay from './Overlay'
import { getRelativePath } from '~/utils/files'

interface MethodItemProps {
  data: MethodData;
}

const MethodItem: React.FC<MethodItemProps> = ({ data }) => {
    const [showOverlay, setShowOverlay] = useState(false)

    const {
        commandName,
        instanceData: { browser, deviceName, platform },
        fileData: { actualFilePath, diffFilePath },
        misMatchPercentage,
        tag,
    } = data

    useEffect(() => {
        if (showOverlay) {
            document.documentElement.classList.add('no-scroll')
        } else {
            document.documentElement.classList.remove('no-scroll')
        }
    }, [showOverlay])

    const handleClick = () => {
        setShowOverlay(true)
    }

    const handleClose = () => {
        setShowOverlay(false)
    }

    const notKnown = 'not-known'
    const browserName = browser?.name || notKnown
    const browserVersion =
    browser?.version === 'not-known' ? notKnown : browser?.version
    const device = deviceName || notKnown
    const platformVersion = platform.version || notKnown
    const imagePath = (
        parseFloat(misMatchPercentage) > 0
            ? getRelativePath(diffFilePath)
            : getRelativePath(actualFilePath)
    ).replace('.png', '-VHTMLR-THUMBNAIL.png')

    return (
        <>
            <div className={styles.card} onClick={handleClick}>
                <div className={styles.imageContainer}>
                    <img
                        src={imagePath}
                        alt={`${tag} screenshot`}

                    />
                </div>
                <div className={styles.instanceData}>
                    <h4>{tag}</h4>
                    <p>Method: {commandName}</p>
                    <p>Mismatch: {misMatchPercentage}%</p>
                    <p>
                        <PlatformIcon platformName={platform.name as PlatformName} />{' '}
                        {platformVersion === notKnown ? '' : platformVersion}
                        <BrowserIcon
                            className={styles.browserIcon}
                            browserName={browserName as BrowserName}
                        />{' '}
                        {browserVersion}
                    </p>
                    {device !== notKnown && <p>Device: {device}</p>}
                </div>
            </div>
            {showOverlay && <Overlay data={data} onClose={handleClose} />}
        </>
    )
}

export default MethodItem
