export const getRelativePath = (fullPath: string): string => {
    const basePath = import.meta.env.BASE_URL || '/'
    const publicPathIndex = fullPath.indexOf('/public/')
    if (publicPathIndex !== -1) {
        return fullPath.slice(publicPathIndex + '/public/'.length)
    }

    return `${basePath}${fullPath}`
}
