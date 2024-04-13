export default async function ocrKeys(value: string): Promise<void> {
    const actionChain = browser.action('key');

    [...value].forEach((char: string) => {
        actionChain.down(char)
    });
    [...value].forEach((char: string) => {
        actionChain.up(char)
    })
    await actionChain.perform()
}
