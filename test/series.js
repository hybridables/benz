/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true, esnext:true */

'use strict'

var fs = require('graceful-fs')
var path = require('path')
var mzfs = require('mz/fs')
var test = require('assertit')
var benz = require('../index')
var Bluebird = require('bluebird')
var alwaysThunk = require('always-thunk')
var readFileThunk = alwaysThunk(fs.readFile)

var filepath = path.join(__dirname, '../package.json')

test('.series()', function () {
  test('should throw if not function, array or object', function (done) {
    function fixture () {
      benz().series(12345)
    }

    test.throws(fixture, TypeError)
    test.throws(fixture, /benz: expect/)
    done()
  })
  test('should accept callback function', function (done) {
    var be = benz().series(function cb (fp, encoding, next) {
      fs.readFile(fp, encoding, next)
    })

    be(filepath, 'utf8', function (err, str) {
      test.ifError(err)
      test.equal(str.indexOf('benz') !== -1, true)
      done()
    })
  })
  test('should accept array of callbacks', function (done) {
    var be = benz().series([
      function (next) {
        next(null, 333)
      },
      function (first, next) {
        next(null, first + 444)
      }
    ])

    be(function (err, res) {
      test.ifError(err)
      test.deepEqual(res, [333, 777])
      done()
    })
  })
  test('should accept object of callbacks', function (done) {
    var be = benz().series({
      foo: function (next) {
        next(null, 123)
      },
      bar: function (first, next) {
        next(null, first + 456)
      }
    })

    be(function (err, res) {
      test.ifError(err)
      test.deepEqual(res, {foo: 123, bar: 579})
      done()
    })
  })
  test('should accept generator function', function (done) {
    var be = benz().series(function * yieldThunk (fp, encoding) {
      return yield readFileThunk(fp, encoding)
    })

    be(filepath, 'utf8', function (err, str) {
      test.ifError(err)
      test.equal(str.indexOf('benz') !== -1, true)
      done()
    })
  })
  test('should accept array of generators', function (done) {
    var be = benz().series([
      function * yieldThunk () {
        return yield readFileThunk(filepath, 'utf8')
      },
      function (content, next) {
        test.equal(content.indexOf('benz') !== -1, true)
        next(null, 456)
      }
    ])

    be(function (err, res) {
      test.ifError(err)
      test.equal(res[0].indexOf('benz') !== -1, true)
      test.equal(res[1], 456)
      test.equal(Array.isArray(res), true)
      done()
    })
  })
  test('should accept object of generators', function (done) {
    var be = benz().series({
      foo: function * yieldThunk () {
        return yield readFileThunk(filepath, 'utf8')
      },
      bar: function (content, next) {
        test.equal(content.indexOf('benz') !== -1, true)
        next(null, 456)
      }
    })

    be(function (err, res) {
      test.ifError(err)
      test.equal(res.foo.indexOf('benz') !== -1, true)
      test.equal(res.bar, 456)
      test.equal(typeof res, 'object')
      done()
    })
  })
  test('should accept function that returns promise', function (done) {
    var be = benz().series(mzfs.readFile)
    be(filepath, 'utf8', function (err, str) {
      test.ifError(err)
      test.equal(str.indexOf('benz') !== -1, true)
      done()
    })
  })
  test('should accept array of promises', function (done) {
    var be = benz().series([
      Bluebird.resolve(200),
      Bluebird.resolve(300)
    ])

    be(function (err, res) {
      test.ifError(err)
      test.deepEqual(res, [200, 300])
      done()
    })
  })
  test('should accept object of promises', function (done) {
    var be = benz().series({
      foo: Bluebird.resolve(123),
      bar: Bluebird.resolve(456)
    })

    be(function (err, res) {
      test.ifError(err)
      test.deepEqual(res, {foo: 123, bar: 456})
      done()
    })
  })
  test('should accept function that returns stream', function (done) {
    var be = benz().series(function (fp) {
      return fs.createReadStream(fp)
    })
    be(filepath, function (err, res) {
      test.ifError(err)
      test.equal(res, undefined)
      done()
    })
  })
})
