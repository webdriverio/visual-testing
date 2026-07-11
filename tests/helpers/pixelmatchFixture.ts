import type { ImageCompareResult } from '@wdio/image-comparison-core'
import { readFileSync } from 'node:fs'
import { expect } from '@wdio/globals'
import { decodeImage } from '../../packages/image-comparison-core/dist/utils/imageUtils.js'

export type PixelmatchFixtureScenario =
    | 'threshold'
    | 'includeAA'
    | 'colorDiff'
    | 'twoToneSwap'
    | 'diffMask'

type FixtureMode = 'baseline' | 'delta'

export const isPixelmatchBaselineSetup = process.env.BASELINE_SETUP === 'true'

export const strictPixelmatchOptions = {
    threshold: 0,
    includeAA: true,
} as const

export const forgivingThresholdPixelmatchOptions = {
    threshold: 0.15,
    includeAA: true,
} as const

export const forgivingIncludeAaPixelmatchOptions = {
    threshold: 0,
    includeAA: false,
} as const
/**
 * Runs in the browser via browser.execute. Keep all fixture drawing logic here so
 * DevTools stack traces point at named functions instead of injected strings.
 */
function renderPixelmatchFixtureInBrowser(
    scenario: PixelmatchFixtureScenario,
    mode: FixtureMode,
): void {
    const canvasSize = 80
    function ensurePixelmatchFixtureHost(): HTMLElement {
        let host = document.getElementById('pixelmatch-fixture')
        if (!host) {
            host = document.createElement('div')
            host.id = 'pixelmatch-fixture'
            host.setAttribute('data-testid', 'pixelmatch-fixture')
            host.style.cssText = [
                'position: fixed',
                'top: 96px',
                'left: 96px',
                `width: ${canvasSize}px`,
                `height: ${canvasSize}px`,
                'z-index: 9999',
                'margin: 0',
                'padding: 0',
                'border: 0',
                'background: transparent',
            ].join(';')
            document.body.appendChild(host)
        }

        return host
    }

    function fillCanvas(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        r: number,
        g: number,
        b: number,
    ): void {
        ctx.fillStyle = `rgb(${r}, ${g}, ${b})`
        ctx.fillRect(0, 0, width, height)
    }

    function drawIncludeAAPattern(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        includeNoise: boolean,
    ): void {
        fillCanvas(ctx, width, height, 255, 255, 255)
        ctx.fillStyle = 'rgb(0, 0, 0)'
        ctx.fillRect(0, 0, Math.floor(width / 2), height)

        if (includeNoise) {
            ctx.fillStyle = 'rgb(170, 170, 170)'
            ctx.fillRect(Math.floor(width / 2), 0, 1, height)
        }
    }

    function drawTwoToneSwap(
        ctx: CanvasRenderingContext2D,
        width: number,
        height: number,
        swapped: boolean,
    ): void {
        fillCanvas(ctx, width, height, 255, 255, 255)
        const half = Math.floor(width / 2)

        if (swapped) {
            ctx.fillStyle = 'rgb(255, 255, 255)'
            ctx.fillRect(0, 0, half, height)
            ctx.fillStyle = 'rgb(0, 0, 0)'
            ctx.fillRect(half, 0, width - half, height)
            return
        }

        ctx.fillStyle = 'rgb(0, 0, 0)'
        ctx.fillRect(0, 0, half, height)
        ctx.fillStyle = 'rgb(255, 255, 255)'
        ctx.fillRect(half, 0, width - half, height)
    }

    const host = ensurePixelmatchFixtureHost()
    host.replaceChildren()

    const canvas = document.createElement('canvas')
    canvas.width = canvasSize
    canvas.height = canvasSize
    canvas.style.imageRendering = 'pixelated'
    host.appendChild(canvas)

    const ctx = canvas.getContext('2d')
    if (!ctx) {
        throw new Error('Could not create 2D canvas context for pixelmatch fixture')
    }

    ctx.imageSmoothingEnabled = false

    switch (scenario) {
    case 'threshold':
        if (mode === 'baseline') {
            fillCanvas(ctx, canvasSize, canvasSize, 100, 100, 100)
        } else {
            fillCanvas(ctx, canvasSize, canvasSize, 140, 100, 100)
        }
        break
    case 'includeAA':
        drawIncludeAAPattern(ctx, canvasSize, canvasSize, mode === 'delta')
        break
    case 'colorDiff':
        if (mode === 'baseline') {
            fillCanvas(ctx, canvasSize, canvasSize, 200, 50, 50)
        } else {
            fillCanvas(ctx, canvasSize, canvasSize, 50, 50, 200)
        }
        break
    case 'twoToneSwap':
        drawTwoToneSwap(ctx, canvasSize, canvasSize, mode === 'delta')
        break
    case 'diffMask':
        fillCanvas(ctx, canvasSize, canvasSize, 240, 240, 240)
        if (mode === 'delta') {
            ctx.fillStyle = 'rgb(20, 20, 20)'
            ctx.fillRect(0, 0, 24, 24)
        }
        break
    default:
        throw new Error(`Unknown pixelmatch fixture scenario: ${scenario as string}`)
    }
}

export async function setupPixelmatchFixture(
    scenario: PixelmatchFixtureScenario,
    applyDelta: boolean,
): Promise<void> {
    const mode: FixtureMode = applyDelta ? 'delta' : 'baseline'
    await browser.execute(renderPixelmatchFixtureInBrowser, scenario, mode)
    await browser.pause(100)
}

export async function checkPixelmatchFixture(
    tag: string,
    options: Record<string, unknown> = {},
): Promise<number | ImageCompareResult> {
    return await browser.checkElement(await $('#pixelmatch-fixture'), tag, {
        removeElements: [await $('nav.navbar')],
        enableLayoutTesting: false,
        ...options,
    }) as number | ImageCompareResult
}

export async function checkPixelmatchFixtureWithData(
    tag: string,
    options: Record<string, unknown> = {},
): Promise<ImageCompareResult> {
    return await checkPixelmatchFixture(tag, {
        returnAllCompareData: true,
        ...options,
    }) as ImageCompareResult
}

export function getDiffPath(result: ImageCompareResult): string {
    expect(result.folders.diff).toBeDefined()
    return result.folders.diff as string
}

export function readPngPixel(
    filePath: string,
    x: number,
    y: number,
): [number, number, number, number] {
    const image = decodeImage(readFileSync(filePath))
    const index = (y * image.width + x) * 4

    return [
        image.data[index],
        image.data[index + 1],
        image.data[index + 2],
        image.data[index + 3],
    ]
}

export function findPngPixelsMatchingColor(
    filePath: string,
    expected: [number, number, number],
): Array<[number, number]> {
    const image = decodeImage(readFileSync(filePath))
    const matches: Array<[number, number]> = []

    for (let y = 0; y < image.height; y++) {
        for (let x = 0; x < image.width; x++) {
            const index = (y * image.width + x) * 4
            if (
                image.data[index] === expected[0]
                && image.data[index + 1] === expected[1]
                && image.data[index + 2] === expected[2]
            ) {
                matches.push([x, y])
            }
        }
    }

    return matches
}
