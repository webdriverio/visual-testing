import { useCallback, useState } from 'react'

export const useTransform = (
    initialTransform = { x: 0, y: 0, scale: 1 },
    externalSetTransform?: React.Dispatch<
    React.SetStateAction<{ x: number; y: number; scale: number }>
  >
) => {
    const [internalTransform, setInternalTransform] = useState(initialTransform)
    const setTransform = externalSetTransform || setInternalTransform

    const handleMouseDown = useCallback(
        (e: React.MouseEvent<HTMLCanvasElement>) => {
            const startX = e.clientX
            const startY = e.clientY

            setTransform((prevTransform) => {
                const startTransform = { ...prevTransform }

                const onMouseMove = (e: MouseEvent) => {
                    const dx = e.clientX - startX
                    const dy = e.clientY - startY
                    setTransform({
                        ...startTransform,
                        x: startTransform.x + dx,
                        y: startTransform.y + dy,
                    })
                }

                const onMouseUp = () => {
                    document.removeEventListener('mousemove', onMouseMove)
                    document.removeEventListener('mouseup', onMouseUp)
                }

                document.addEventListener('mousemove', onMouseMove)
                document.addEventListener('mouseup', onMouseUp)

                return startTransform
            })
        },
        [setTransform]
    )

    const handleWheel = useCallback(
        (e: WheelEvent) => {
            e.preventDefault()
            const scaleAmount = e.deltaY * -0.01
            setTransform((prev) => ({
                ...prev,
                scale: Math.min(Math.max(0.1, prev.scale + scaleAmount), 50),
            }))
        },
        [setTransform]
    )

    return {
        transform: internalTransform,
        setTransform,
        handleMouseDown,
        handleWheel,
    }
}
