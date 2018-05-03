var root = require('./root').root

var DOMException = root.DOMException
try {
  new DOMException()
} catch (err) {
  DOMException = function DOMException(message, name) {
    this.message = message
    this.name = name
    var error = Error(message)
    this.stack = error.stack
  }
  DOMException.prototype = Object.create(Error.prototype)
  DOMException.prototype.constructor = DOMException
}

exports.DOMException = DOMException
