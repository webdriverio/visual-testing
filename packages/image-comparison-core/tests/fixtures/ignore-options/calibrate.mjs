import { writeFileSync, mkdirSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const root = join(__dirname, '../../..')
const { encodeImage, createCanvas } = await import(join(root, 'dist/utils/imageUtils.js'))
const compareImages = (await import(join(root, 'dist/pixelmatch/compareImages.js'))).default

function setPixel(data, width, x, y, r, g, b, a = 255) {
    const i = (y * width + x) * 4
    data[i] = r
    data[i + 1] = g
    data[i + 2] = b
    data[i + 3] = a
}

function fillRect(data, width, x, y, w, h, r, g, b, a = 255) {
    for (let py = y; py < y + h; py++) {
        for (let px = x; px < x + w; px++) {
            setPixel(data, width, px, py, r, g, b, a)
        }
    }
}

function buildFixtures() {
    const colorBaseline = createCanvas(16, 16, 180, 60, 60, 255)
    const colorActual = createCanvas(16, 16, 96, 96, 96, 255)

    const alphaBaseline = createCanvas(16, 16, 80, 120, 160, 255)
    const alphaActual = createCanvas(16, 16, 80, 120, 160, 255)
    setPixel(alphaActual.data, 16, 8, 8, 80, 120, 160, 120)

    const rgbBaseline = createCanvas(16, 16, 100, 100, 100, 255)
    const rgbActual = createCanvas(16, 16, 114, 100, 100, 255)

    const fontBaseline = createCanvas(32, 32, 255, 255, 255, 255)
    fillRect(fontBaseline.data, 32, 8, 10, 10, 12, 0, 0, 0)
    const fontActual = createCanvas(32, 32, 255, 255, 255, 255)
    fillRect(fontActual.data, 32, 8, 10, 11, 12, 0, 0, 0)

    const aaBaseline = createCanvas(40, 40, 255, 255, 255, 255)
    fillRect(aaBaseline.data, 40, 0, 0, 20, 40, 0, 0, 0)
    const aaActual = createCanvas(40, 40, 255, 255, 255, 255)
    fillRect(aaActual.data, 40, 0, 0, 20, 40, 0, 0, 0)
    for (let y = 0; y < 40; y++) {
        setPixel(aaActual.data, 40, 20, y, 170, 170, 170)
    }

    return {
        'color-only-diff-baseline.png': encodeImage(colorBaseline),
        'color-only-diff-actual.png': encodeImage(colorActual),
        'alpha-only-diff-baseline.png': encodeImage(alphaBaseline),
        'alpha-only-diff-actual.png': encodeImage(alphaActual),
        'within-rgb-tolerance-baseline.png': encodeImage(rgbBaseline),
        'within-rgb-tolerance-actual.png': encodeImage(rgbActual),
        'font-size-plus-one-baseline.png': encodeImage(fontBaseline),
        'font-size-plus-one-actual.png': encodeImage(fontActual),
        'aa-edge-noise-baseline.png': encodeImage(aaBaseline),
        'aa-edge-noise-actual.png': encodeImage(aaActual),
    }
}

async function runCase(name, baseline, actual, ignore) {
    const result = await compareImages(baseline, actual, { ignore })
    const pass = result.rawMisMatchPercentage === 0
    console.log(`${name} ignore=${JSON.stringify(ignore ?? [])} -> ${result.rawMisMatchPercentage.toFixed(4)}% ${pass ? 'PASS' : 'FAIL'}`)
}

mkdirSync(__dirname, { recursive: true })
const fixtures = buildFixtures()
for (const [file, buffer] of Object.entries(fixtures)) {
    writeFileSync(join(__dirname, file), buffer)
}

console.log('--- color-only-diff ---')
await runCase('default', fixtures['color-only-diff-baseline.png'], fixtures['color-only-diff-actual.png'])
await runCase('ignoreColors', fixtures['color-only-diff-baseline.png'], fixtures['color-only-diff-actual.png'], 'colors')

console.log('--- alpha-only-diff ---')
await runCase('default', fixtures['alpha-only-diff-baseline.png'], fixtures['alpha-only-diff-actual.png'])
await runCase('ignoreAlpha', fixtures['alpha-only-diff-baseline.png'], fixtures['alpha-only-diff-actual.png'], 'alpha')

console.log('--- within rgb ---')
await runCase('ignoreLess', fixtures['within-rgb-tolerance-baseline.png'], fixtures['within-rgb-tolerance-actual.png'], 'less')
await runCase('ignoreNothing', fixtures['within-rgb-tolerance-baseline.png'], fixtures['within-rgb-tolerance-actual.png'], 'nothing')

console.log('--- font size ---')
await runCase('default', fixtures['font-size-plus-one-baseline.png'], fixtures['font-size-plus-one-actual.png'])
await runCase('ignoreAntialiasing', fixtures['font-size-plus-one-baseline.png'], fixtures['font-size-plus-one-actual.png'], 'antialiasing')

console.log('--- aa edge ---')
await runCase('strict', fixtures['aa-edge-noise-baseline.png'], fixtures['aa-edge-noise-actual.png'])
await runCase('ignoreAntialiasing', fixtures['aa-edge-noise-baseline.png'], fixtures['aa-edge-noise-actual.png'], 'antialiasing')
