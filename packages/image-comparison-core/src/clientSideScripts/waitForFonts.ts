/**
 * Wait for the fonts to be loaded, do this for a max of 11 seconds
 *
 * NOTE: writing this with promises instead of async/await because it fails with
 * `javascript error: __awaiter is not defined` when running in the browser
 */
export default function waitForFonts(): Promise<void|string> {
    return new Promise((resolve, reject) => {
        const timeoutPromise = new Promise<void>((_, reject) => {
            setTimeout(() => {
                reject(new Error('Font loading timed out'))
            }, 11000)
        })

        Promise.race([document.fonts.ready, timeoutPromise])
            .then(() => {
                resolve('All fonts have loaded')
            })
            .catch(reject)
    })
}
