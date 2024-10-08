import { useEffect, useRef, useCallback, useState } from 'react'
import type { BoundingBox, CanvasDrawingProps } from '../types'
import styles from '../components/Canvas.module.css'
// This is done because NextJS can't handle ESLINT flat configs yet

import { getTransformedBoxes } from '../utils/boundingBoxUtils'

export const useCanvasDrawing = ({
    imageRef,
    canvasRef,
    transform,
    diffBoxes,
    highlightedBox,
    ignoredBoxes,
}: CanvasDrawingProps) => {
    const transformedDiffBoxesRef = useRef<BoundingBox[]>([])
    const transformedIgnoredBoxesRef = useRef<BoundingBox[]>([])
    const hoveredBoxRef = useRef<BoundingBox | null>(null)
    const hoveredTextRef = useRef<string | null>(null)
    const hoveredBoxColorRef = useRef<string | null>(null)
    const [highlightedOnce, setHighlightedOnce] = useState(false)

    const drawBoxes = (
        boxes: BoundingBox[],
        context: CanvasRenderingContext2D,
        color: string,
        drawWidth: number,
        drawHeight: number,
        drawX: number,
        drawY: number,
        scale: number
    ) => {
        const transformedBoxes = getTransformedBoxes(
            boxes,
            drawWidth,
            drawHeight,
            drawX,
            drawY,
            imageRef.current!.width,
            imageRef.current!.height,
            scale
        )

        transformedBoxes.forEach((box) => {
            const boxWidth = box.right - box.left
            const boxHeight = box.bottom - box.top

            context.save()
            context.globalAlpha = 0.5
            context.fillStyle = color
            context.fillRect(box.left, box.top, boxWidth, boxHeight)
            context.restore()
        })

        return transformedBoxes
    }

    const drawHoverEffect = (
        box: BoundingBox,
        context: CanvasRenderingContext2D,
        color: string,
        hoverText: string
    ) => {
        const boxWidth = box.right - box.left
        const boxHeight = box.bottom - box.top

        context.save()
        context.globalAlpha = 1
        context.strokeStyle = color
        context.lineWidth = 4
        context.strokeRect(box.left, box.top, boxWidth, boxHeight)

        if (hoverText) {
            context.fillStyle = color
            context.font = '12px Arial'
            context.fillText(hoverText, box.left, box.top - 5)
        }
        context.restore()
    }

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

        transformedDiffBoxesRef.current = drawBoxes(
            diffBoxes,
            context,
            'rgba(255, 0, 255, 0.5)',
            drawWidth,
            drawHeight,
            drawX,
            drawY,
            scale
        )

        transformedIgnoredBoxesRef.current = drawBoxes(
            ignoredBoxes,
            context,
            'rgba(57, 170, 86, 0.5)',
            drawWidth,
            drawHeight,
            drawX,
            drawY,
            scale
        )

        if (hoveredBoxRef.current && hoveredTextRef.current && hoveredBoxColorRef.current) {
            drawHoverEffect(
                hoveredBoxRef.current,
                context,
                hoveredBoxColorRef.current,
                hoveredTextRef.current
            )
        }

        if (highlightedBox && !highlightedOnce) {
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

            transformedDiffBoxesRef.current.forEach((box) => {
                if (
                    Math.abs(box.left - translatedBox.left) < 1 &&
                    Math.abs(box.top - translatedBox.top) < 1 &&
                    Math.abs(box.right - translatedBox.right) < 1 &&
                    Math.abs(box.bottom - translatedBox.bottom) < 1
                ) {
                    const existingCircles = document.querySelectorAll(
                        `.${styles.highlightCircle}`
                    )
                    existingCircles.forEach((circle) => circle.remove())

                    const circle = document.createElement('div')
                    circle.className = styles.highlightCircle
                    circle.style.left = `${
                        canvas.offsetLeft + (box.left + box.right) / 2
                    }px`
                    circle.style.top = `${
                        canvas.offsetTop + (box.top + box.bottom) / 2
                    }px`

                    canvas.parentElement?.appendChild(circle)

                    setTimeout(() => {
                        circle.remove()
                        setHighlightedOnce(true)
                    }, 1000)
                }
            })
        }
    }, [canvasRef, imageRef, transform, diffBoxes, highlightedBox, highlightedOnce, ignoredBoxes])

    const handleMouseMove = useCallback((event: MouseEvent) => {
        const canvas = canvasRef.current
        if (!canvas) {return}

        const rect = canvas.getBoundingClientRect()
        const mouseX = event.clientX - rect.left
        const mouseY = event.clientY - rect.top

        const hoveredIgnoredBox = transformedIgnoredBoxesRef.current.find(
            (box) =>
                mouseX >= box.left &&
                mouseX <= box.right &&
                mouseY >= box.top &&
                mouseY <= box.bottom
        )

        const hoveredDiffBox = transformedDiffBoxesRef.current.find(
            (box) =>
                mouseX >= box.left &&
                mouseX <= box.right &&
                mouseY >= box.top &&
                mouseY <= box.bottom
        )

        if (hoveredIgnoredBox) {
            hoveredBoxRef.current = hoveredIgnoredBox
            hoveredTextRef.current = 'Ignored area'
            hoveredBoxColorRef.current = 'rgba(57, 170, 86, 1)'
        } else if (hoveredDiffBox) {
            hoveredBoxRef.current = hoveredDiffBox
            hoveredTextRef.current = 'Diff area'
            hoveredBoxColorRef.current = 'rgba(255, 0, 255, 1)'
        } else {
            hoveredBoxRef.current = null
            hoveredTextRef.current = null
            hoveredBoxColorRef.current = null
        }

        handleResize()
    }, [handleResize])

    const handleMouseLeave = useCallback(() => {
        hoveredBoxRef.current = null
        hoveredTextRef.current = null
        hoveredBoxColorRef.current = null
        handleResize()
    }, [handleResize])

    useEffect(() => {
        const canvas = canvasRef.current
        if (canvas) {
            canvas.addEventListener('mousemove', handleMouseMove)
            canvas.addEventListener('mouseleave', handleMouseLeave)
        }

        return () => {
            if (canvas) {
                canvas.removeEventListener('mousemove', handleMouseMove)
                canvas.removeEventListener('mouseleave', handleMouseLeave)
            }
        }
    }, [handleMouseMove, handleMouseLeave, canvasRef])
    useEffect(() => {
        if (imageRef.current && canvasRef.current) {
            imageRef.current.onload = handleResize
        }
    }, [handleResize, imageRef, canvasRef])
    useEffect(() => {
        if (highlightedBox) {
            setHighlightedOnce(false)
        }
    }, [highlightedBox])
    useEffect(() => {
        if (imageRef.current && canvasRef.current) {
            handleResize()
        }
    }, [canvasRef, handleResize, imageRef])

    return transformedDiffBoxesRef
}
