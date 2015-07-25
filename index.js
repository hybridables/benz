/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true, esnext:true */

'use strict'

var util = require('util')
var kindOf = require('kind-of')
var Options = require('option-cache')
var isObject = require('is-extendable')
var factory = require('./lib/factory')

/**
 * Expose `Benz`
 */

module.exports = Benz

/**
 * > Create a new instance of `Benz`.
 *
 * **Example**
 *
 * ```js
 * var Benz = require('benz')
 * var benz = new Benz()
 * ```
 *
 * @param {Object} `[options]` Initialize with default options.
 * @api public
 */

function Benz (options) {
  if (!(this instanceof Benz)) {
    return new Benz(options)
  }

  Options.call(this, options)
  this._defaultOptions()
}

util.inherits(Benz, Options)

/**
 * > Setting default options to use.
 *
 * @name  _defaultOptions
 * @return {Object} Benz instance for chaining
 */

Benz.prototype._defaultOptions = function _defaultOptions () {
  if (!this.hasOption('context') || !isObject(this.option('context'))) {
    this.option('context', null)
  }
  if (!this.hasOption('promise') || !this.isBoolean('promise')) {
    this.option('promise', false)
  }
  if (!this.hasOption('parallel') || !this.isBoolean('parallel')) {
    this.option('parallel', false)
  }
  if (!this.hasOption('flatten') || !this.isBoolean('flatten')) {
    this.option('flatten', true)
  }
  if (!this.hasOption('onlylast') || !this.isBoolean('onlylast')) {
    this.option('onlylast', false)
  }
  if (!this.hasOption('done') || kindOf(this.option('done')) !== 'function') {
    this.option('done', function noop () {})
  }
  if (!this.hasOption('extensions') || kindOf(this.option('extensions')) !== 'object') {
    this.option('extensions', null)
  }
  if (!this.hasOption('promisify') || kindOf(this.option('promisify')) !== 'function') {
    this.option('promisify', require('hybridify'))
  }
  if (!this.hasOption('generatorify') || kindOf(this.option('generatorify')) !== 'function') {
    this.option('generatorify', require('co').wrap)
  }
  return this
}

/**
 * > Used internally to create `.parallel`
 * and `.series` methods.
 *
 * **Example**
 *
 * ```js
 * var fs = require('fs')
 * var benz = require('benz')
 * var series = benz().compose('series')
 *
 * var done = series([
 *   function (fp, encoding, next) {
 *     fs.readFile(fp, encoding, next)
 *   },
 *   function (content, next) {
 *     var name = JSON.parse(content).name
 *     next(null, name)
 *   }
 * ])
 *
 * done('./package.json', 'utf8', function (err, res) {
 *   console.log(err) //=> null
 *   console.log(res)
 *   //=> ['{\n  "name": "benz",\n  "version": "0.4.0" ...', 'benz']
 * })
 * ```
 *
 * @name  compose
 * @param  {String} `<method>` all available [now-and-later][nal] methods or `series`, or `parallel`
 * @return {Function} composed function
 * @api public
 */

Benz.prototype.compose = function compose (method) {
  if (!method && typeof method !== 'string') {
    throw new TypeError('benz#compose expect string')
  }
  return factory(this, method)
}

/**
 * > Run `fns` (plugins stack) in series.
 *
 * **Example**
 *
 * ```js
 * var done = benz.series([
 *   function one (initial, next) {
 *     setTimeout(function () {
 *       console.log('second')
 *       next(null, initial + 555)
 *     }, Math.random() * 50)
 *   },
 *   function two (initial, next) {
 *     setTimeout(function () {
 *       console.log('third')
 *       next(null, initial + 333)
 *     }, Math.random() * 200)
 *   },
 *   function three (initial, next) {
 *     setTimeout(function () {
 *       console.log('first')
 *       next(null, initial + 111)
 *     }, 0)
 *   }
 * ])
 *
 * done(222, function (err, res) {
 *   //=> 'second'
 *   //=> 'third'
 *   //=> 'first'
 *
 *   console.log(err, res)
 *   //=> [777, 555, 111]
 * })
 * ```
 *
 * @name  series
 * @param  {Function|Array|Object} `<fns>` plugins stack
 * @param  {Object} `[extensions]` passed to [now-and-later][nal]
 * @return {Function} final done callback
 * @api public
 */

Benz.prototype.series = function series (fns, extensions) {
  return this.compose('series')(fns, extensions)
}

/**
 * > Run `fns` (plugins stack) in paralell
 * and maintain order of the results.
 *
 * **Example**
 *
 * ```js
 * var done = benz.parallel([
 *   function one (initial, next) {
 *     setTimeout(function () {
 *       console.log('second')
 *       next(null, initial + 300)
 *     }, Math.random() * 50)
 *   },
 *   function two (initial, next) {
 *     setTimeout(function () {
 *       console.log('third')
 *       next(null, initial + 100)
 *     }, Math.random() * 200)
 *   },
 *   function three (initial, next) {
 *     setTimeout(function () {
 *       console.log('first')
 *       next(null, initial + 444)
 *     }, 0)
 *   }
 * ])
 *
 * done(100, function (err, res) {
 *   //=> 'first'
 *   //=> 'second'
 *   //=> 'third'
 *
 *   console.log(err, res)
 *   //=> [400, 200, 544]
 * })
 * ```
 *
 * @name  parallel
 * @param  {Function|Array|Object} `<fns>` plugins stack
 * @param  {Object} `[extensions]` passed to [now-and-later][nal]
 * @return {Function} final done callback
 * @api public
 */

Benz.prototype.parallel = function parallel (fns, extensions) {
  return this.compose('parallel')(fns, extensions)
}

/**
 * > Alias of `.series` and `.parallel`. By default will run the stack in series,
 * otherwise in parallel, but only if parallel option is enabled.
 *
 * **Example**
 *
 * ```js
 * var fs = require('fs')
 * var done = benz.enable('onlylast').run([
 *   fs.readFile,
 *   function (content, next) {
 *     next(null, JSON.parse(content).name)
 *   }
 * ])
 *
 * done('./package.json', 'utf8', function (err, res) {
 *   console.log(err, res) //=> null 'benz'
 * })
 * ```
 *
 * @name  run
 * @param  {Function|Array|Object} `<fns>` plugins stack
 * @param  {Object} `[extensions]` passed to [now-and-later][nal]
 * @return {Function} final done callback
 * @api public
 */

Benz.prototype.run = function run (fns, extensions) {
  if (this.enabled('parallel')) {
    return this.parallel(fns, extensions)
  }
  return this.series(fns, extensions)
}
