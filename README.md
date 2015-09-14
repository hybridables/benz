
<p align="center">
  <img src="./benz.png">
</p>

<p align="center">
  <a href="https://codeclimate.com/github/tunnckoCore/benz">
    <img src="https://img.shields.io/codeclimate/github/tunnckoCore/benz.svg">
  </a>
  <a href="https://github.com/feross/standard">
  <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg">
  </a>
  <a href="https://travis-ci.org/tunnckoCore/benz">
    <img src="https://img.shields.io/travis/tunnckoCore/benz.svg">
  </a>
  <a href="https://coveralls.io/r/tunnckoCore/benz">
    <img src="https://img.shields.io/coveralls/tunnckoCore/benz.svg">
  </a>
  <a href="https://david-dm.org/tunnckoCore/benz">
    <img src="https://img.shields.io/david/tunnckoCore/benz.svg">
  </a>
</p>

# benz [![npmjs.com][npmjs-img]][npmjs-url] [![The MIT License][license-img]][license-url] 

> Compose your control flow with absolute elegance. Support async/await, callbacks, thunks, generators, promises, observables, child processes and streams. Can power applications that need to have plugins. Useful for creating task, test and bench runners. Built with backward compatibility and future stability in mind.


## Install
```
npm i benz --save
npm test
```


## Usage
> For more use-cases see the [tests](./test.js)

```js
var benz = require('benz')
```


## API
### [Benz](./index.js#L38)
> Create a new instance of `Benz`.

- `[options]` **{Object}** Initialize with default options.    

**Example**

```js
var Benz = require('benz')
var benz = new Benz()
```

### [.compose](./index.js#L121)
> Used internally to create `.parallel` and `.series` methods.

- `<method>` **{String}** all available [now-and-later][nal] methods or `series`, or `parallel`    
- `returns` **{Function}** composed function  

**Example**

```js
var fs = require('fs')
var benz = require('benz')
var series = benz().compose('series')

var done = series([
  function (fp, encoding, next) {
    fs.readFile(fp, encoding, next)
  },
  function (content, next) {
    var name = JSON.parse(content).name
    next(null, name)
  }
])

done('./package.json', 'utf8', function (err, res) {
  console.log(err) //=> null
  console.log(res)
  //=> ['{\n  "name": "benz",\n  "version": "0.4.0" ...', 'benz']
})
```

### [.series](./index.js#L172)
> Run `fns` (plugins stack) in series.

- `<fns>` **{Function|Array|Object}** plugins stack    
- `[extensions]` **{Object}** passed to [now-and-later][nal]    
- `returns` **{Function}** final done callback  

**Example**

```js
var done = benz.series([
  function one (initial, next) {
    setTimeout(function () {
      console.log('second')
      next(null, initial + 555)
    }, Math.random() * 50)
  },
  function two (initial, next) {
    setTimeout(function () {
      console.log('third')
      next(null, initial + 333)
    }, Math.random() * 200)
  },
  function three (initial, next) {
    setTimeout(function () {
      console.log('first')
      next(null, initial + 111)
    }, 0)
  }
])

done(222, function (err, res) {
  //=> 'second'
  //=> 'third'
  //=> 'first'

  console.log(err, res)
  //=> [777, 555, 111]
})
```

### [.parallel](./index.js#L221)
> Run `fns` (plugins stack) in paralell and maintain order of the results.

- `<fns>` **{Function|Array|Object}** plugins stack    
- `[extensions]` **{Object}** passed to [now-and-later][nal]    
- `returns` **{Function}** final done callback  

**Example**

```js
var done = benz.parallel([
  function one (initial, next) {
    setTimeout(function () {
      console.log('second')
      next(null, initial + 300)
    }, Math.random() * 50)
  },
  function two (initial, next) {
    setTimeout(function () {
      console.log('third')
      next(null, initial + 100)
    }, Math.random() * 200)
  },
  function three (initial, next) {
    setTimeout(function () {
      console.log('first')
      next(null, initial + 444)
    }, 0)
  }
])

done(100, function (err, res) {
  //=> 'first'
  //=> 'second'
  //=> 'third'

  console.log(err, res)
  //=> [400, 200, 544]
})
```

### [.run](./index.js#L253)
> Alias of `.series` and `.parallel`. By default will run the stack in series,
otherwise in parallel, but only if parallel option is enabled.

- `<fns>` **{Function|Array|Object}** plugins stack    
- `[extensions]` **{Object}** passed to [now-and-later][nal]    
- `returns` **{Function}** final done callback  

**Example**

```js
var fs = require('fs')
var done = benz.enable('onlylast').run([
  fs.readFile,
  function (content, next) {
    next(null, JSON.parse(content).name)
  }
])

done('./package.json', 'utf8', function (err, res) {
  console.log(err, res) //=> null 'benz'
})
```


## Contributing
Pull requests and stars are always welcome. For bugs and feature requests, [please create an issue](https://github.com/tunnckoCore/benz/issues/new).  
But before doing anything, please read the [CONTRIBUTING.md](./CONTRIBUTING.md) guidelines.


## [Charlike Make Reagent](http://j.mp/1stW47C) [![new message to charlike][new-message-img]][new-message-url] [![freenode #charlike][freenode-img]][freenode-url]

[![tunnckocore.tk][author-www-img]][author-www-url] [![keybase tunnckocore][keybase-img]][keybase-url] [![tunnckoCore npm][author-npm-img]][author-npm-url] [![tunnckoCore twitter][author-twitter-img]][author-twitter-url] [![tunnckoCore github][author-github-img]][author-github-url]


[nal]: https://travis-ci.org/phated/now-and-later

[npmjs-url]: https://www.npmjs.com/package/benz
[npmjs-img]: https://img.shields.io/npm/v/benz.svg?label=benz

[license-url]: https://github.com/tunnckoCore/benz/blob/master/LICENSE.md
[license-img]: https://img.shields.io/badge/license-MIT-blue.svg


[codeclimate-url]: https://codeclimate.com/github/tunnckoCore/benz
[codeclimate-img]: https://img.shields.io/codeclimate/github/tunnckoCore/benz.svg

[travis-url]: https://travis-ci.org/tunnckoCore/benz
[travis-img]: https://img.shields.io/travis/tunnckoCore/benz.svg

[coveralls-url]: https://coveralls.io/r/tunnckoCore/benz
[coveralls-img]: https://img.shields.io/coveralls/tunnckoCore/benz.svg

[david-url]: https://david-dm.org/tunnckoCore/benz
[david-img]: https://img.shields.io/david/tunnckoCore/benz.svg

[standard-url]: https://github.com/feross/standard
[standard-img]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg


[author-www-url]: http://www.tunnckocore.tk
[author-www-img]: https://img.shields.io/badge/www-tunnckocore.tk-fe7d37.svg

[keybase-url]: https://keybase.io/tunnckocore
[keybase-img]: https://img.shields.io/badge/keybase-tunnckocore-8a7967.svg

[author-npm-url]: https://www.npmjs.com/~tunnckocore
[author-npm-img]: https://img.shields.io/badge/npm-~tunnckocore-cb3837.svg

[author-twitter-url]: https://twitter.com/tunnckoCore
[author-twitter-img]: https://img.shields.io/badge/twitter-@tunnckoCore-55acee.svg

[author-github-url]: https://github.com/tunnckoCore
[author-github-img]: https://img.shields.io/badge/github-@tunnckoCore-4183c4.svg

[freenode-url]: http://webchat.freenode.net/?channels=charlike
[freenode-img]: https://img.shields.io/badge/freenode-%23charlike-5654a4.svg

[new-message-url]: https://github.com/tunnckoCore/messages
[new-message-img]: https://img.shields.io/badge/send%20me-message-green.svg
