/** Resemble.js ITU-R BT.601 luma weights used for ignoreColors brightness comparison. */
export const RESEMBLE_LUMA_WEIGHTS = { r: 0.3, g: 0.59, b: 0.11 } as const

export function toResembleBrightness(r: number, g: number, b: number): number {
    const { r: redWeight, g: greenWeight, b: blueWeight } = RESEMBLE_LUMA_WEIGHTS
    return Math.round(redWeight * r + greenWeight * g + blueWeight * b)
}

export function applyResembleGrayscale(pixels: Buffer, totalPixels: number): void {
    for (let i = 0; i < totalPixels * 4; i += 4) {
        const luma = toResembleBrightness(pixels[i], pixels[i + 1], pixels[i + 2])
        pixels[i] = luma
        pixels[i + 1] = luma
        pixels[i + 2] = luma
    }
}
