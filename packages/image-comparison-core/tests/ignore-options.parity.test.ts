import { readFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, it, expect } from 'vitest'
import compareImages from '../src/pixelmatch/compareImages.js'
import type { ComparisonIgnoreOption } from '../src/pixelmatch/compare.interfaces.js'

const fixturesDir = join(dirname(fileURLToPath(import.meta.url)), 'fixtures/ignore-options')

function loadFixture(name: string): Buffer {
    return readFileSync(join(fixturesDir, name))
}

async function compareFixturePair(
    baselineName: string,
    actualName: string,
    ignore?: ComparisonIgnoreOption | ComparisonIgnoreOption[],
) {
    return compareImages(loadFixture(baselineName), loadFixture(actualName), { ignore })
}

function expectPass(result: Awaited<ReturnType<typeof compareFixturePair>>) {
    expect(result.rawMisMatchPercentage).toBe(0)
    expect(result.misMatchPercentage).toBe(0)
}

function expectFail(result: Awaited<ReturnType<typeof compareFixturePair>>) {
    expect(result.rawMisMatchPercentage).toBeGreaterThan(0)
}

describe('ignore-options golden fixture parity', () => {
    describe('color-only diff', () => {
        const baseline = 'color-only-diff-baseline.png'
        const actual = 'color-only-diff-actual.png'

        it('fails with strict comparison (no ignore flags)', async () => {
            expectFail(await compareFixturePair(baseline, actual))
        })

        it('passes with ignoreColors', async () => {
            expectPass(await compareFixturePair(baseline, actual, 'colors'))
        })
    })

    describe('alpha-only diff', () => {
        const baseline = 'alpha-only-diff-baseline.png'
        const actual = 'alpha-only-diff-actual.png'

        it('fails with strict comparison (no ignore flags)', async () => {
            expectFail(await compareFixturePair(baseline, actual))
        })

        it('passes with ignoreAlpha', async () => {
            expectPass(await compareFixturePair(baseline, actual, 'alpha'))
        })
    })

    describe('within 16/255 RGB tolerance', () => {
        const baseline = 'within-rgb-tolerance-baseline.png'
        const actual = 'within-rgb-tolerance-actual.png'

        it('passes with ignoreLess', async () => {
            expectPass(await compareFixturePair(baseline, actual, 'less'))
        })

        it('fails with ignoreNothing', async () => {
            expectFail(await compareFixturePair(baseline, actual, 'nothing'))
        })
    })

    describe('font size +1px', () => {
        const baseline = 'font-size-plus-one-baseline.png'
        const actual = 'font-size-plus-one-actual.png'

        it.each([
            'nothing',
            'less',
            'antialiasing',
            'alpha',
            'colors',
        ] as const)('fails with ignore: %s', async (ignore) => {
            expectFail(await compareFixturePair(baseline, actual, ignore))
        })
    })

    describe('sub-pixel AA edge noise', () => {
        const baseline = 'aa-edge-noise-baseline.png'
        const actual = 'aa-edge-noise-actual.png'

        it('fails with strict comparison (no ignore flags)', async () => {
            expectFail(await compareFixturePair(baseline, actual))
        })

        it('passes with ignoreAntialiasing', async () => {
            expectPass(await compareFixturePair(baseline, actual, 'antialiasing'))
        })
    })
})
