const { config } = require('./wdio.local.dev.tools.desktop.conf')

// ============
// Capabilities
// ============
config.specs = ['./tests/specs/init.spec.js']

exports.config = config
