/*!
 * benz <https://github.com/tunnckoCore/benz>
 *
 * Copyright (c) 2015 Charlike Mike Reagent <@tunnckoCore> (http://www.tunnckocore.tk)
 * Released under the MIT license.
 */

/* jshint asi:true, esnext:true */

'use strict'

var test = require('assertit')

test('benz:', function () {
  require('./test/errors')
  require('./test/series')
  // require('./test/parallel')
  // require('./test/run')
  require('./test/options')
})
