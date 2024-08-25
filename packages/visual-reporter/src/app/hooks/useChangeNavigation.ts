import { useState, useCallback, useEffect } from 'react'
import type { BoundingBox } from '../types'
import { useTransform } from './useTransform.js'
import { getTransformedBoxes } from '../utils/boundingBoxUtils.js'

export const useChangeNavigation = (
    diffBoundingBoxes: BoundingBox[],
    actualImagePath: string
) => {
    const { transform, setTransform } = useTransform()
    const [currentChange, setCurrentChange] = useState(-1)

    const centerImage = useCallback(() => {
        setTransform({ x: 0, y: 0, scale: 1 })
    }, [setTransform])

    const centerChange = useCallback(
        (index: number) => {
            if (index === -1) {
                centerImage()
                return
            }

            if (index < 0 || index >= diffBoundingBoxes.length) {return}

            const box = diffBoundingBoxes[index]
            const canvas = document.querySelector(
                '.diffContainer canvas'
            ) as HTMLCanvasElement
            if (!canvas) {return}

            const { width: canvasWidth, height: canvasHeight } =
        canvas.getBoundingClientRect()

            const image = new Image()
            image.src = actualImagePath

            image.onload = () => {
                const imageWidth = image.width
                const imageHeight = image.height
                const aspectRatio = imageWidth / imageHeight

                let drawWidth, drawHeight
                if (canvasWidth / canvasHeight > aspectRatio) {
                    drawHeight = canvasHeight
                    drawWidth = drawHeight * aspectRatio
                } else {
                    drawWidth = canvasWidth
                    drawHeight = drawWidth / aspectRatio
                }

                const maxDimension = Math.max(imageWidth, imageHeight)
                const scale =
          maxDimension > 3000
              ? 8
              : maxDimension > 2000
                  ? 6
                  : maxDimension > 1000
                      ? 4
                      : 2
                const drawX = (canvasWidth - drawWidth * scale) / 2
                const drawY = (canvasHeight - drawHeight * scale) / 2

                const transformedBoxes = getTransformedBoxes(
                    [box],
                    drawWidth,
                    drawHeight,
                    drawX,
                    drawY,
                    imageWidth,
                    imageHeight,
                    scale
                )

                const transformedBox = transformedBoxes[0]
                const centerX = (transformedBox.left + transformedBox.right) / 2
                const centerY = (transformedBox.top + transformedBox.bottom) / 2

                setTransform({
                    x: canvasWidth / 2 - centerX,
                    y: canvasHeight / 2 - centerY,
                    scale: scale,
                })
            }
        },
        [diffBoundingBoxes, actualImagePath, setTransform, centerImage]
    )

    useEffect(() => {
        if (currentChange === -1) {
            centerImage()
        } else if (currentChange >= 0 && diffBoundingBoxes.length > 0) {
            centerChange(currentChange)
        }
    }, [currentChange, diffBoundingBoxes, centerChange, centerImage])

    const handlePrevChange = () => {
        setCurrentChange((prev) => {
            if (prev === -1) {
                return diffBoundingBoxes.length - 1
            }
            if (prev === 0) {
                centerImage()
                return -1
            }
            return prev - 1
        })
    }

    const handleNextChange = () => {
        setCurrentChange((prev) => {
            if (prev === diffBoundingBoxes.length - 1) {
                centerImage()
                return -1
            }
            return prev + 1
        })
    }

    return {
        transform,
        setTransform,
        currentChange,
        handlePrevChange,
        handleNextChange,
    }
}
