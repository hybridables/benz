/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true, esnext:true */

'use strict'

var kindOf = require('kind-of')
var isGenFn = require('is-es6-generator-function')
var isPromise = require('is-promise')
var asyncDone = require('async-done')
var nowAndLater = require('now-and-later')
var handleArguments = require('handle-arguments')
var manageArguments = require('manage-arguments')

module.exports = function factory (method) {
  return function _factory_ (fns, extensions) {
    if (kindOf(fns) === 'function') {
      fns = [fns]
    }
    if (kindOf(fns) !== 'array' && kindOf(fns) !== 'object') {
      throw new TypeError('benz: expect `fns` to be array, object or function')
    }
    if (kindOf(extensions) === 'object') {
      var extend = require('extend-shallow')
      extensions = extend(this.option('extensions') || {}, extensions)
    } else {
      extensions = this.option('extensions')
    }

    var self = this

    function complete () {
      var argz = handleArguments(arguments)
      var ctx = self.option('context')
      var results = []
      var index = 0

      function iterator (fn, next) {
        var res = results.length ? results.shift() : argz.args
        fn = isPromise(fn) ? wrapify(fn) : fn
        fn = isGenFn(fn) ? self.option('generatorify')(fn) : fn
        fn = bindify(fn, ctx, res)

        asyncDone(fn, function (err) {
          if (err) { return next(err) }

          var args = manageArguments(arguments).slice(1)
          results.push(args)

          if (args.length === 0) {
            return next(null)
          }
          if (args.length === 1) {
            return next(null, args[0])
          }

          next(null, args)
        })
      }

      nowAndLater[method](fns, iterator, extensions, lastCallback(ctx, argz.callback))
    }

    function lastCallback (ctx, done) {
      done = done || self.option('done')

      return function lastCb () {
        var args = manageArguments(arguments)
        var err = args[0]
        var res = args.slice(1).shift()
        var last = res[res.length - 1]
        res = kindOf(res) === 'array' ? res.filter(Boolean) : res

        if (self.enabled('flatten') && fns.length === 1) {
          self.disable('flatten')
        }
        if (self.enabled('onlylast')) {
          return done.call(ctx, err, last)
        }
        if (self.disabled('flatten')) {
          return done.apply(ctx, [err].concat(res))
        }

        return done.call(ctx, err, res)
      }
    }

    if (this.enabled('promise')) {
      return this.option('promisify')(complete)
    }
    return complete
  }
}

/**
 * utils
 */

function bindify (fn, thisArg, args) {
  return fn.bind.apply(fn, [thisArg].concat(args))
}

function wrapify (promise) {
  return function () {
    return promise
  }
}
