/**
 * Add or remove the transparency from the text
 */
export default function toggleTextTransparency(enableTransparency: boolean): void {
    if (enableTransparency) {
        const elements = document.querySelectorAll<HTMLElement>('body *:not(script):not(style)')
        elements.forEach(el => {
            el.style.setProperty('color', 'transparent', 'important')
        })
        return
    }

    const elements = document.querySelectorAll<HTMLElement>('body [color]:not(script):not(style)')
    elements.forEach(el => {
        el.style.removeProperty('color')
    })
}
