import { describe, it, expect, vi } from 'vitest'
import { rmSync } from 'node:fs'
import BaseClass from './base.js'

vi.mock('node:fs', () => ({
    ...vi.importActual('node:fs'),
    rmSync: vi.fn(),
}))

describe('BaseClass', () => {
    it('initializes default options correctly', () => {
        const options = { }
        const instance = new BaseClass(options)

        expect(instance.defaultOptions).toMatchSnapshot()
    })

    it('initializes folders with default values', () => {
        const instance = new BaseClass({})

        expect(instance.folders.actualFolder).toMatchSnapshot()
        expect(instance.folders.baselineFolder).toMatchSnapshot()
        expect(instance.folders.diffFolder).toMatchSnapshot()
    })

    it('initializes folders with custom values', () => {
        const options = {
            baselineFolder: 'custom/baseline',
            screenshotPath: 'custom/screenshots',
        }
        const instance = new BaseClass(options)

        expect(instance.folders.baselineFolder).toBe('custom/baseline')
        expect(instance.folders.actualFolder).toContain('custom/screenshots')
    })

    it('handles functional baselineFolder and screenshotPath', () => {
        const options = {
            baselineFolder: () => 'functional/baseline',
            screenshotPath: () => 'functional/screenshots',
        }
        const instance = new BaseClass(options)

        expect(instance.folders.baselineFolder).toBe('functional/baseline')
        expect(instance.folders.actualFolder).toContain('functional/screenshots')
    })

    it('should not clear runtime folders in the constructor - clearing should only happen once in the launcher (issue #683)', () => {
        vi.mocked(rmSync).mockClear()
        new BaseClass({ clearRuntimeFolder: true })
        expect(rmSync).not.toHaveBeenCalled()
    })
})
