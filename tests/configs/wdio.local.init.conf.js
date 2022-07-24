const { config } = require('./wdio.local.desktop.conf')

// ============
// Capabilities
// ============
config.specs = ['./tests/specs/init.spec.js']

exports.config = config
