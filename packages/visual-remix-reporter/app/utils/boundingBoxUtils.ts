import type { BoundingBox } from '../types'

export const getTransformedBoxes = (
    boxes: BoundingBox[],
    drawWidth: number,
    drawHeight: number,
    drawX: number,
    drawY: number,
    imageWidth: number,
    imageHeight: number,
    scale: number
): BoundingBox[] =>
    boxes.map((box) => ({
        left: box.left * (drawWidth / imageWidth) * scale + drawX,
        top: box.top * (drawHeight / imageHeight) * scale + drawY,
        right: box.right * (drawWidth / imageWidth) * scale + drawX,
        bottom: box.bottom * (drawHeight / imageHeight) * scale + drawY,
    }))

export const translateBox = (
    box: BoundingBox,
    drawWidth: number,
    drawHeight: number,
    drawX: number,
    drawY: number,
    imageWidth: number,
    imageHeight: number,
    scale: number
): BoundingBox => ({
    left: box.left * (drawWidth / imageWidth) * scale + drawX,
    top: box.top * (drawHeight / imageHeight) * scale + drawY,
    right: box.right * (drawWidth / imageWidth) * scale + drawX,
    bottom: box.bottom * (drawHeight / imageHeight) * scale + drawY,
})
