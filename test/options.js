/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true, esnext:true */

'use strict'

var test = require('assertit')
var benz = require('../index')

test('options', function () {
  test('should have default options', function (done) {
    var opts = benz().options

    test.equal(opts.promise, false)
    test.equal(opts.flatten, true)
    test.equal(opts.onlylast, false)
    test.equal(opts.extensions, null)
    test.equal(opts.context, null)
    done()
  })
  test('should accept options from constructor', function (done) {
    var opts = benz({promise: true, foo: 'bar'}).options

    test.equal(opts.promise, true)
    test.equal(opts.foo, 'bar')
    done()
  })
  test('should be able to control options through `.option` method', function (done) {
    var be = benz()
    be.option('foo', 'bar')
    be.option('baz', 'qux')

    test.equal(be.options.foo, 'bar')
    test.equal(be.options.baz, 'qux')
    done()
  })
  test('should be able to do chaining', function (done) {
    var be = benz()
    be.option('promise', 'bar').option('baz', 'qux')

    test.equal(be.options.promise, 'bar')
    test.equal(be.options.baz, 'qux')
    done()
  })
  test('should have `enable` and `disable` methods', function (done) {
    var be = benz()
    be.enable('promise').enable('onlylast').disable('flatten')

    test.equal(be.options.promise, true)
    test.equal(be.options.onlylast, true)
    test.equal(be.options.flatten, false)
    done()
  })
  test('should extend/merge options with that defined in `.option`', function (done) {
    var be = benz({foo: 'bar'})
    be.option('baz', 'qux').option('obj', {a: 'b'}).enable('promise').disable('flatten')

    test.equal(be.options.foo, 'bar')
    test.equal(be.options.baz, 'qux')
    test.equal(be.options.promise, true)
    test.equal(be.options.flatten, false)
    test.deepEqual(be.options.obj, {a: 'b'})
    done()
  })
})
