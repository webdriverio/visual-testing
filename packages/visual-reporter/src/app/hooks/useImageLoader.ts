import { useEffect, useRef } from 'react'

export const useImageLoader = (
    imageSrc: string,
    onImageLoad: (image: HTMLImageElement) => void
) => {
    const imageRef = useRef<HTMLImageElement>(new Image())

    useEffect(() => {
        const image = imageRef.current
        image.src = imageSrc

        image.onload = () => {
            onImageLoad(image)
        }

        return () => {
            image.onload = null
        }
    }, [imageSrc, onImageLoad])

    return imageRef
}
