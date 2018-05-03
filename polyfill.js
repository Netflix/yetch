var root = require('./src/internal/root').root
var fetch = require('./src/internal/fetch').fetch;
var Headers = require('./src/internal/Headers').Headers;
var Request = require('./src/internal/Request').Request;
var Response = require('./src/internal/Response').Response;

function nativeFetchSupportsAbort() {
  return !!root.AbortController && !!root.Request && 'signal' in root.Request.prototype
}

if (!root.fetch || !nativeFetchSupportsAbort()) {
  root.fetch = fetch
  root.Headers = Headers
  root.Request = Request
  root.Response = Response
}
