import { Key } from 'webdriverio'

export default async function sendKeys(value: string, submitValue: boolean): Promise<void> {
    const actionChain = browser.action('key');

    [...value].forEach((char: string) => {
        actionChain.down(char)
    });
    [...value].forEach((char: string) => {
        actionChain.up(char)
    })

    if (submitValue) {
        /**
         * XCTest API only allows to send keypresses (e.g. keydown+keyup).
         */
        if (!browser.isIOS){
            actionChain.pause(50)
        }
        actionChain.down(Key.Enter)
        actionChain.up(Key.Enter)
    }
    await actionChain.perform()
}
