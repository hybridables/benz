/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true, esnext:true */

'use strict'

var fs = require('graceful-fs')
var mzfs = require('mz/fs')
var test = require('assertit')
var benz = require('./index')
var Bluebird = require('bluebird')

var alwaysThunk = require('always-thunk')
var readFileThunk = alwaysThunk(fs.readFile)

test('benz:', function () {
  test('should handle errors gracefully', function () {
    test('should handle callback errors', function (done) {
      var be = benz().series([
        function (a, next) {
          next(new Error('foo bar: ' + a))
        },
        Bluebird.resolve(456)
      ])

      be('yesh', function (err, res) {
        test.equal(err.message, 'foo bar: yesh')
        test.equal(res.length, 0)
        test.deepEqual(res, [])
        done()
      })
    })
    test('should handle errors when promise rejects', function (done) {
      var cnt = 0
      var be = benz().series([
        function (a) {
          cnt++
          this.foo = a + 11
          return Bluebird.resolve(this.foo)
        },
        function (a) {
          cnt++
          test.equal(cnt, 2)
          test.equal(a, 33)
          test.equal(this.foo, 33)
          return Bluebird.reject(new Error('msg'))
        }
      ])

      be(22, function (err, res) {
        test.equal(err.message, 'msg')
        test.equal(cnt, 2)
        done()
      })
    })
    test('should always receive results from `fns` before first error', function (done) {
      var be = benz().series([
        function (foo, next) {
          this.foo = foo
          next(null, this.foo + 'data')
        },
        function (foodata, next) {
          test.equal(foodata, 'foodata')
          next(new Error('err'))
        },
        /* istanbul ignore next */
        function (next) {
          this.foobar = this.foo + 'bar'
          next(null, this.foobar)
        }
      ])

      be('foo', function (err, res) {
        test.equal(err.message, 'err')
        test.equal(res.length, 1)
        test.equal(res[0], 'foodata')
        test.equal(this.foobar, undefined)
        done()
      })
    })
  })
  test('options', function () {
    test('should have default options', function (done) {
      var opts = benz().options

      test.equal(opts.promise, false)
      test.equal(opts.flatten, true)
      test.equal(opts.onlylast, false)
      test.equal(opts.extensions, false)
      test.deepEqual(opts.context, {})
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
  test('.series', function () {
    test('should throw if not function, array or object', function (done) {
      function fixture () {
        benz().series(12345)
      }

      test.throws(fixture, TypeError)
      test.throws(fixture, /benz: expect/)
      done()
    })
    test('should support passing `extensions` to `now-and-later`', function (done) {
      var after = []
      var create = []
      var serials = [function first (a, next) {
        next(null, a)
      }, function second (a, next) {
        next(null, a + 22)
      }]

      var be = benz().series(serials, {
        create: function (value, idx) {
          create[idx] = value
          return { idx: idx, value: value }
        },
        after: function (result, storage) {
          after[storage.idx] = result
        }
      })

      be(12, function (err, res) {
        test.ifError(err)
        test.deepEqual(serials, create)
        done()
      })
    })
    test('should accept callback functions', function (done) {
      var be = benz().series(function cb (fp, encoding, next) {
        fs.readFile(fp, encoding, next)
      })

      be('./package.json', 'utf8', function (err, str) {
        test.ifError(err)
        test.equal(str.indexOf('benz') !== -1, true)
        done()
      })
    })
    test('should accept generator functions', function (done) {
      var be = benz().series(function * yieldThunk (fp, encoding) {
        return yield readFileThunk(fp, encoding)
      })

      be('./package.json', 'utf8', function (err, str) {
        test.ifError(err)
        test.equal(str.indexOf('benz') !== -1, true)
        done()
      })
    })
    test('should accept promises', function (done) {
      var be = benz().series(mzfs.readFile)
      be('./package.json', 'utf8', function (err, str) {
        test.ifError(err)
        test.equal(str.indexOf('benz') !== -1, true)
        done()
      })
    })
    test('should accept array stack', function (done) {
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
    test('should accept object of functions', function (done) {
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
    test('should asyncness be guaranteed', function (done) {
      var be = benz().series([
        Bluebird.resolve(200),
        function (val, next) {
          var self = this
          this.foo = val
          setTimeout(function () {
            self.bar = 'qux'
            next(null, val + 111)
          }, Math.random() * 3000)
        },
        function (a, next) {
          test.equal(this.foo, 200)
          test.equal(this.bar, 'qux')
          test.equal(a, 311)
          next(null, this.foo + a)
        }
      ])

      be(function (err, res) {
        test.ifError(err)
        test.deepEqual(res, [200, 311, 511])
        done()
      })
    })
    // wait `async-done`
    // test('should asyncness be guaranteed', function (done) {
    //   var be = benz().series([
    //     Bluebird.resolve(200),
    //     function (val, next) {
    //       var self = this
    //       this.foo = val
    //       setTimeout(function () {
    //         self.bar = 'qux'
    //         next(null, val + 111, 300, 400) // @todo
    //       }, Math.random() * 3000)
    //     },
    //     function (a, b, c, next) {
    //       test.equal(this.foo, 200)
    //       test.equal(this.bar, 'qux')
    //       test.equal(a, 311)
    //       test.equal(b, 300)
    //       test.equal(c, 400)
    //       next(null, a + b + c)
    //     }
    //   ])

    //   be(function (err, res) {
    //     test.ifError(err)
    //     test.deepEqual(res, [200, 311, 1011])
    //   })
    //   done()
    // })
  })
  test('controling with enable/disable/option', function () {
    test('should benz() return hybrid if opts.promise enabled', function (done) {
      var cnt = 10
      var be = benz().enable('promise').series(function (val, next) {
        next(null, val)
      })
      be('foo bar', function (err, res) {
        test.ifError(err)
        test.equal(res, 'foo bar')
        cnt += 11
      })
      .then(function (res) {
        test.equal(res, 'foo bar')
        test.equal(cnt, 21)
        done()
      })
    })
    test('should pass only last result if opts.onlylast enabled ', function (done) {
      var be = benz().enable('onlylast').series([
        function (a, next) {
          next(null, a)
        },
        function (a, next) {
          next(null, a + 10)
        }
      ])

      be(11, function (err, res) {
        test.ifError(err)
        test.equal(res, 21)
        done()
      })
    })
    test('should expand to callback args if opts.flatten disabled', function (done) {
      var be = benz().disable('flatten').series([
        function (a, next) {
          next(null, a)
        },
        function (a, next) {
          next(null, a + 11)
        }
      ])

      be(22, function (err, first, second) {
        test.ifError(err)
        test.equal(first, 22)
        test.equal(second, 33)
        done()
      })
    })
  })
})
