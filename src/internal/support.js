var root = require('./root').root

exports.support = {
  searchParams: 'URLSearchParams' in root,
  iterable: 'Symbol' in root && 'iterator' in Symbol,
  blob: 'FileReader' in root && 'Blob' in root && (function() {
    try {
      new Blob()
      return true
    } catch (e) {
      return false
    }
  })(),
  formData: 'FormData' in root,
  arrayBuffer: 'ArrayBuffer' in root
}
