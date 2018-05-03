/* global describe, it, require */

var equal = require('chai').assert.equal
var isFunction = require('chai').assert.isFunction
var Yetch = require('../')

describe('Common JS', function () {
  it('should provide all the CJS exports', function() {
    isFunction(Yetch.fetch)
    isFunction(Yetch.Headers)
    isFunction(Yetch.Request)
    isFunction(Yetch.Response)
  })

  it('should not polyfill by default', function() {
    equal(typeof fetch === 'undefined', true)
  });

  it('should polyfill if you import yetch/polyfill', function () {
    var rootModule = require('../src/internal/root')
    var originalRoot = rootModule.root
    var root = rootModule.root = {}
    require('../polyfill')

    equal(root.fetch, Yetch.fetch)
    equal(root.Headers, Yetch.Headers)
    equal(root.Request, Yetch.Request)
    equal(root.Response, Yetch.Response)

    // make sure that our mock didn't accidentally *actually* polyfill the node.js global
    equal(typeof fetch === 'undefined', true)
    equal(typeof Headers === 'undefined', true)
    equal(typeof Request === 'undefined', true)
    equal(typeof Response === 'undefined', true)

    rootModule.root = originalRoot
  });
})