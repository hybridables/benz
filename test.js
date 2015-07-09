/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true */

'use strict'

// var fs = require('graceful-fs')
// var mzfs = require('mz/fs')
var test = require('assertit')
var benz = require('./index')

test('benz:', function () {
  console.log(benz().option('a', 'abc'))
})
