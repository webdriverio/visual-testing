import { decode, encode } from 'fast-png'
import type { PngDataArray } from 'fast-png'

export interface RawImage {
    data: Uint8Array
    width: number
    height: number
}

// Convert any channel count to RGBA 8-bit. fast-png may decode RGB, grayscale, or clamped PNGs.
function toRGBA(data: PngDataArray, channels: number, width: number, height: number): Uint8Array {
    if (channels === 4 && (data instanceof Uint8Array || data instanceof Uint8ClampedArray)) {
        return new Uint8Array(data.buffer, data.byteOffset, data.byteLength)
    }
    const pixels = width * height
    const out = new Uint8Array(pixels * 4)
    for (let i = 0; i < pixels; i++) {
        if (channels === 3) {
            out[i * 4]     = data[i * 3]
            out[i * 4 + 1] = data[i * 3 + 1]
            out[i * 4 + 2] = data[i * 3 + 2]
            out[i * 4 + 3] = 255
        } else if (channels === 1) {
            const v = data[i]
            out[i * 4]     = v
            out[i * 4 + 1] = v
            out[i * 4 + 2] = v
            out[i * 4 + 3] = 255
        } else if (channels === 2) {
            const v = data[i * 2]
            out[i * 4]     = v
            out[i * 4 + 1] = v
            out[i * 4 + 2] = v
            out[i * 4 + 3] = data[i * 2 + 1]
        } else {
            // 4-channel Uint16Array: downsample 16-bit → 8-bit
            out[i * 4]     = data[i * 4] >> 8
            out[i * 4 + 1] = data[i * 4 + 1] >> 8
            out[i * 4 + 2] = data[i * 4 + 2] >> 8
            out[i * 4 + 3] = data[i * 4 + 3] >> 8
        }
    }
    return out
}

export function decodeImage(buffer: Buffer): RawImage {
    const png = decode(buffer)
    return {
        data: toRGBA(png.data, png.channels, png.width, png.height),
        width: png.width,
        height: png.height,
    }
}

export function encodeImage(img: RawImage): Buffer {
    return Buffer.from(encode({ data: img.data, width: img.width, height: img.height, channels: 4, depth: 8 }))
}

export function toBase64Png(img: RawImage): string {
    return encodeImage(img).toString('base64')
}

export function createCanvas(width: number, height: number, r = 0, g = 0, b = 0, a = 0): RawImage {
    const data = new Uint8Array(width * height * 4)
    if (r !== 0 || g !== 0 || b !== 0 || a !== 0) {
        for (let i = 0; i < data.length; i += 4) {
            data[i]     = r
            data[i + 1] = g
            data[i + 2] = b
            data[i + 3] = a
        }
    }
    return { data, width, height }
}

export function cropImage(img: RawImage, x: number, y: number, w: number, h: number): RawImage {
    const data = new Uint8Array(w * h * 4)
    const rowBytes = w * 4
    for (let row = 0; row < h; row++) {
        const srcOffset = ((y + row) * img.width + x) * 4
        data.set(img.data.subarray(srcOffset, srcOffset + rowBytes), row * rowBytes)
    }
    return { data, width: w, height: h }
}

// Porter-Duff "over" compositing. Mutates base in place.
export function compositeImage(base: RawImage, overlay: RawImage, offsetX: number, offsetY: number, opacity = 1): void {
    for (let oy = 0; oy < overlay.height; oy++) {
        const by = oy + offsetY
        if (by < 0 || by >= base.height) { continue }
        for (let ox = 0; ox < overlay.width; ox++) {
            const bx = ox + offsetX
            if (bx < 0 || bx >= base.width) { continue }

            const si = (oy * overlay.width + ox) * 4
            const di = (by * base.width + bx) * 4

            const srcA = (overlay.data[si + 3] / 255) * opacity
            const dstA = base.data[di + 3] / 255
            const outA = srcA + dstA * (1 - srcA)

            if (outA === 0) { continue }

            base.data[di]     = Math.round((overlay.data[si]     * srcA + base.data[di]     * dstA * (1 - srcA)) / outA)
            base.data[di + 1] = Math.round((overlay.data[si + 1] * srcA + base.data[di + 1] * dstA * (1 - srcA)) / outA)
            base.data[di + 2] = Math.round((overlay.data[si + 2] * srcA + base.data[di + 2] * dstA * (1 - srcA)) / outA)
            base.data[di + 3] = Math.round(outA * 255)
        }
    }
}

export function resizeBilinear(img: RawImage, newW: number, newH: number): RawImage {
    const data = new Uint8Array(newW * newH * 4)
    const xRatio = img.width / newW
    const yRatio = img.height / newH

    for (let dy = 0; dy < newH; dy++) {
        const sy = dy * yRatio
        const y0 = Math.floor(sy)
        const y1 = Math.min(y0 + 1, img.height - 1)
        const yFrac = sy - y0

        for (let dx = 0; dx < newW; dx++) {
            const sx = dx * xRatio
            const x0 = Math.floor(sx)
            const x1 = Math.min(x0 + 1, img.width - 1)
            const xFrac = sx - x0

            const i00 = (y0 * img.width + x0) * 4
            const i10 = (y0 * img.width + x1) * 4
            const i01 = (y1 * img.width + x0) * 4
            const i11 = (y1 * img.width + x1) * 4
            const di  = (dy * newW + dx) * 4

            const w00 = (1 - xFrac) * (1 - yFrac)
            const w10 = xFrac * (1 - yFrac)
            const w01 = (1 - xFrac) * yFrac
            const w11 = xFrac * yFrac

            data[di]     = Math.round(img.data[i00]     * w00 + img.data[i10]     * w10 + img.data[i01]     * w01 + img.data[i11]     * w11)
            data[di + 1] = Math.round(img.data[i00 + 1] * w00 + img.data[i10 + 1] * w10 + img.data[i01 + 1] * w01 + img.data[i11 + 1] * w11)
            data[di + 2] = Math.round(img.data[i00 + 2] * w00 + img.data[i10 + 2] * w10 + img.data[i01 + 2] * w01 + img.data[i11 + 2] * w11)
            data[di + 3] = Math.round(img.data[i00 + 3] * w00 + img.data[i10 + 3] * w10 + img.data[i01 + 3] * w01 + img.data[i11 + 3] * w11)
        }
    }
    return { data, width: newW, height: newH }
}

// 90° clockwise: new width = srcHeight, new height = srcWidth
// dst(dx, dy) ← src(col=dy, row=srcH-1-dx)
export function rotate90CW(img: RawImage): RawImage {
    const { width: srcW, height: srcH } = img
    const data = new Uint8Array(srcW * srcH * 4)
    const newW = srcH
    const newH = srcW

    for (let dy = 0; dy < newH; dy++) {
        for (let dx = 0; dx < newW; dx++) {
            const si = ((srcH - 1 - dx) * srcW + dy) * 4
            const di = (dy * newW + dx) * 4
            data[di]     = img.data[si]
            data[di + 1] = img.data[si + 1]
            data[di + 2] = img.data[si + 2]
            data[di + 3] = img.data[si + 3]
        }
    }
    return { data, width: newW, height: newH }
}

// 90° counter-clockwise: new width = srcHeight, new height = srcWidth
// dst(dx, dy) ← src(col=srcW-1-dy, row=dx)
export function rotate90CCW(img: RawImage): RawImage {
    const { width: srcW, height: srcH } = img
    const data = new Uint8Array(srcW * srcH * 4)
    const newW = srcH
    const newH = srcW

    for (let dy = 0; dy < newH; dy++) {
        for (let dx = 0; dx < newW; dx++) {
            const si = (dx * srcW + (srcW - 1 - dy)) * 4
            const di = (dy * newW + dx) * 4
            data[di]     = img.data[si]
            data[di + 1] = img.data[si + 1]
            data[di + 2] = img.data[si + 2]
            data[di + 3] = img.data[si + 3]
        }
    }
    return { data, width: newW, height: newH }
}

export function rotate180(img: RawImage): RawImage {
    const data = new Uint8Array(img.data.length)
    const total = img.width * img.height
    for (let i = 0; i < total; i++) {
        const si = i * 4
        const di = (total - 1 - i) * 4
        data[di]     = img.data[si]
        data[di + 1] = img.data[si + 1]
        data[di + 2] = img.data[si + 2]
        data[di + 3] = img.data[si + 3]
    }
    return { data, width: img.width, height: img.height }
}

// Multiply every pixel's alpha channel by opacity (0–1). Mutates in place.
export function setOpacity(img: RawImage, opacity: number): void {
    for (let i = 3; i < img.data.length; i += 4) {
        img.data[i] = Math.round(img.data[i] * opacity)
    }
}
