/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true, esnext:true */

'use strict'

var fs = require('graceful-fs')
var test = require('assertit')
var benz = require('../index')
var Bluebird = require('bluebird')

test('should handle errors gracefully', function () {
  test('when error is passed to callback', function (done) {
    var be = benz().series([
      function (a, next) {
        next(new Error('foo:err ' + a))
      },
      Bluebird.resolve(456)
    ])

    be(123, function (err, res) {
      test.equal(err.message, 'foo:err 123')
      test.equal(res.length, 0)
      test.deepEqual(res, [])
      done()
    })
  })
  test('when promise rejects', function (done) {
    var be = benz().series([
      function (a) {
        return Bluebird.reject(new Error('foo:err ' + a))
      },
      Bluebird.resolve(456)
    ])

    be(123, function (err, res) {
      test.equal(err.message, 'foo:err 123')
      test.equal(res.length, 0)
      test.deepEqual(res, [])
      done()
    })
  })
  test('when stream errors', function (done) {
    var be = benz().series([
      function (filepath) {
        return fs.createReadStream(filepath)
      },
      Bluebird.resolve(456)
    ])

    be('./not_exist', function (err, res) {
      test.equal(err.code, 'ENOENT')
      test.equal(res.length, 0)
      test.deepEqual(res, [])
      done()
    })
  })
  test('and receive results passed before error', function (done) {
    var be = benz().series([
      function (one, next) {
        next(null, one + 1)
      },
      function (two, next) {
        test.equal(two, 2)
        next(null, two + 100)
      },
      function (foo, next) {
        this.bar = foo
        test.equal(foo, 102)
        next(new Error('foo msg'))
      },
      function (next) {
        this.data = 'foobar'
        next(null, this.bar)
      }
    ])

    be(1, function (err, res) {
      test.equal(err.message, 'foo msg')
      test.equal(res.length, 2)
      test.equal(this.data, undefined)
      test.equal(this.bar, 102)
      test.deepEqual(this, {bar: 102})
      test.deepEqual(res, [2, 102])
      done()
    })
  })
})

