import { useEffect, useRef, useCallback } from 'react'
import type { BoundingBox } from '../types'
import styles from '../components/Canvas.module.css'
import { getTransformedBoxes } from '../utils/boundingBoxUtils.js'

export const useCanvasDrawing = (
    imageRef: React.RefObject<HTMLImageElement>,
    canvasRef: React.RefObject<HTMLCanvasElement>,
    transform: { x: number; y: number; scale: number },
    diffBoxes: BoundingBox[],
    highlightedBox: BoundingBox | null
) => {
    const transformedBoxesRef = useRef<BoundingBox[]>([])

    const handleResize = useCallback(() => {
        if (!canvasRef.current || !imageRef.current) {return}

        const canvas = canvasRef.current
        const image = imageRef.current
        const context = canvas.getContext('2d')
        if (!context) {return}

        const style = window.getComputedStyle(canvas)
        const width = parseInt(style.width)
        const height = parseInt(style.height)

        canvas.width = width
        canvas.height = height

        const { x, y, scale } = transform
        const canvasWidth = canvas.width
        const canvasHeight = canvas.height
        const aspectRatio = image.width / image.height

        let drawWidth, drawHeight
        if (canvasWidth / canvasHeight > aspectRatio) {
            drawHeight = canvasHeight
            drawWidth = drawHeight * aspectRatio
        } else {
            drawWidth = canvasWidth
            drawHeight = drawWidth / aspectRatio
        }

        const drawX = x + (canvasWidth - drawWidth * scale) / 2
        const drawY = y + (canvasHeight - drawHeight * scale) / 2

        context.clearRect(0, 0, canvas.width, canvas.height)
        context.drawImage(
            image,
            drawX,
            drawY,
            drawWidth * scale,
            drawHeight * scale
        )

        const newTransformedBoxes = getTransformedBoxes(
            diffBoxes,
            drawWidth,
            drawHeight,
            drawX,
            drawY,
            image.width,
            image.height,
            scale
        )

        transformedBoxesRef.current = newTransformedBoxes

        newTransformedBoxes.forEach((box) => {
            const boxWidth = box.right - box.left
            const boxHeight = box.bottom - box.top

            context.save()
            context.globalAlpha = 0.5
            context.fillStyle = 'rgba(255, 0, 255, 0.5)'
            context.fillRect(box.left, box.top, boxWidth, boxHeight)

            if (highlightedBox) {
                const translatedBox = getTransformedBoxes(
                    [highlightedBox],
                    drawWidth,
                    drawHeight,
                    drawX,
                    drawY,
                    image.width,
                    image.height,
                    scale
                )[0]

                if (
                    Math.abs(box.left - translatedBox.left) < 1 &&
          Math.abs(box.top - translatedBox.top) < 1 &&
          Math.abs(box.right - translatedBox.right) < 1 &&
          Math.abs(box.bottom - translatedBox.bottom) < 1
                ) {
                    const existingCircles = document.querySelectorAll(
                        `.${styles['highlight-circle']}`
                    )
                    existingCircles.forEach((circle) => circle.remove())

                    const circle = document.createElement('div')
                    circle.className = styles['highlight-circle']
                    circle.style.left = `${
                        canvas.offsetLeft + (box.left + box.right) / 2
                    }px`
                    circle.style.top = `${
                        canvas.offsetTop + (box.top + box.bottom) / 2
                    }px`

                    canvas.parentElement?.appendChild(circle)

                    setTimeout(() => {
                        circle.remove()
                    }, 1000)
                }
            }
            context.restore()
        })
    }, [canvasRef, imageRef, transform, diffBoxes, highlightedBox])

    useEffect(() => {
        if (imageRef.current && canvasRef.current) {
            imageRef.current.onload = handleResize
        }
    }, [handleResize, imageRef, canvasRef])

    useEffect(() => {
        if (imageRef.current && canvasRef.current) {
            handleResize()
        }
    }, [canvasRef, handleResize, imageRef])

    return transformedBoxesRef
}
