/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

'use strict'

var util = require('util')
var kindOf = require('kind-of')
var Options = require('option-cache')
var factory = require('./lib/factory')

/**
 * Expose `Benz`
 */

module.exports = Benz

/**
 * Create a new instance of `Benz`.
 *
 * @param {Object} `options` Initialize with default options.
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

Benz.prototype._defaultOptions = function () {
  if (!this.hasOption('context')) {
    this.option('context', {})
  }
  if (!this.hasOption('promise') || !this.isBoolean('promise')) {
    this.option('promise', false)
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
    this.option('extensions', false)
  }
  if (!this.hasOption('promisify') || kindOf(this.option('promisify')) !== 'function') {
    this.option('promisify', require('hybridify'))
  }
  if (!this.hasOption('generatorify') || kindOf(this.option('generatorify')) !== 'function') {
    this.option('generatorify', require('co').wrap)
  }
  return this
}

Benz.prototype.series = factory('mapSeries')
Benz.prototype.parallel = factory('map')
