export function checkMetaTag() {
    const meta = document.querySelector("meta[name='viewport']")
    if (!meta) {
        const newMeta = document.createElement('meta')
        newMeta.name = 'viewport'
        newMeta.content = 'width=device-width, initial-scale=1'
        document.head.appendChild(newMeta)
    }
}
