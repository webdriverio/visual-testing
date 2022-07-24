const { accessSync } = require('fs-extra')

/**
 * Check if a file exists
 */
module.exports = function fileExists(filePath) {
    try {
        accessSync(filePath)
        return true
    } catch (err) {
        return false
    }
}
