import React, { useEffect } from 'react'
import styles from './Overlay.module.css'
import type { MethodData } from '../types'
import OverlayHeader from './OverlayHeader'
import Canvas from './Canvas'
import { useChangeNavigation } from '../hooks/useChangeNavigation'
import { getRelativePath } from '~/utils/files'

interface OverlayProps {
  data: MethodData;
  onClose: () => void;
}

const Overlay: React.FC<OverlayProps> = ({ data, onClose }) => {
    const {
        boundingBoxes: { diffBoundingBoxes = [], ignoredBoxes=[] },
        fileData: { actualFilePath, baselineFilePath },
    } = data
    const baselineImagePath = getRelativePath(baselineFilePath)
    const actualImagePath = getRelativePath(actualFilePath)
    const {
        transform,
        setTransform,
        currentChange,
        handlePrevChange,
        handleNextChange,
    } = useChangeNavigation(diffBoundingBoxes, actualImagePath)
    useEffect(() => {
        const handlePopState = (_event: PopStateEvent) => onClose()

        window.addEventListener('popstate', handlePopState)
        window.history.pushState(null, '')

        return () => window.removeEventListener('popstate', handlePopState)
    }, [onClose])

    return (
        <div className={styles.overlay}>
            <OverlayHeader
                data={data}
                onClose={onClose}
                currentChange={currentChange}
                totalChanges={diffBoundingBoxes.length}
                onPrevChange={handlePrevChange}
                onNextChange={handleNextChange}
            />
            <div className={styles.content}>
                <div className={`${styles.canvasContainer} diffContainer`}>
                    <Canvas
                        imageSrc={baselineImagePath}
                        transform={transform}
                        setTransform={setTransform}
                    />
                    <Canvas
                        imageSrc={actualImagePath}
                        transform={transform}
                        setTransform={setTransform}
                        diffBoxes={diffBoundingBoxes}
                        highlightedBox={
                            currentChange !== -1 ? diffBoundingBoxes[currentChange] : null
                        }
                        ignoredBoxes={ignoredBoxes}
                    />
                </div>
            </div>
        </div>
    )
}

export default Overlay
