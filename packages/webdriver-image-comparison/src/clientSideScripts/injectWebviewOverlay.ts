/**
 * Inject an overlay on top of the webview with an event listener that stores the click position in the webview
 */
export function injectWebviewOverlay(isAndroid: boolean): void {
    if (document.querySelector('[data-test="ics-overlay"]')) { return }

    const overlay = document.createElement('div')
    const dpr = isAndroid ? window.devicePixelRatio : 1
    overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100vw;
    height: ${document.documentElement.clientHeight}px;
    background: rgba(255, 165, 0, 0.5); z-index: 2147483647;
    display: flex; flex-direction: column; align-items: center; justify-content: center;
    color: black; font-size: 36px; font-family: Arial, sans-serif; text-align: center;`
    overlay.dataset.test = 'ics-overlay'

    const textContainer = document.createElement('div')
    textContainer.innerText = 'This overlay is used to determine the position of the webview.'
    overlay.appendChild(textContainer)

    overlay.onclick = (event) => {
        const { clientX: x, clientY: y } = event
        const data = {
            left: Math.round(x * dpr),
            top: Math.round(y * dpr),
            width: Math.round(window.innerWidth * dpr),
            height: Math.round(document.documentElement.clientHeight * dpr),
        }

        overlay.dataset.icsWebviewData = JSON.stringify(data)
        textContainer.innerHTML = `
        This overlay is used to determine the position of the webview.<br>
        Clicked at: X: ${data.left}, Y: ${data.top}<br/>
        Dimensions: Viewport width: ${data.width}, Viewport height: ${data.height}`
    }

    document.body.appendChild(overlay)
}
