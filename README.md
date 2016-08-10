# ![Moovie](http://colinaarts.com/assets/code/moovie/moovie.png)

[![Build Status][build-img]][build-url]

An advanced HTML5 video player for MooTools.

## Installation
If you are using Moovie for your web app then the recommended way of installing this package is via [Bower](https://bower.io/):

```bash
$ bower install moovie
```

If you are helping to develop Moovie, then use [npm](https://www.npmjs.com/):

```bash
$ npm install moovie
```

## Basic Usage
```js
// procedural-style
$$('video').toMoovie({
    // shared options
    autohideControls: false
});

// OOP-style
var player = new Moovie('avatar', {
    // instance-specific options
    debugger: true,
    playlist: [
        {
            'id': 'alice',
            'src': 'http://colinaarts.com/assets/alice.ogv'
        },
        {
            'id': 'shrek',
            'src': 'http://colinaarts.com/assets/shrek.ogv',
            'title': '<cite>Shrek Forever After</cite> theatrical trailer'
        }
    ]
});
```

And in your HTML:

```html
<div id="video">
    <div class="wrapper">
        <video src="video.mp4" poster="video.png"></video>
    </div>
</div>
```

## Contributing

> Please see [CONTRIBUTING](CONTRIBUTING.md).

## <a name="license"></a>License

> Copyright &copy; 2010 [Colin Aarts](colin@colinaarts.com)
>
> Please see [LICENSE](LICENSE.md) for more information.

[build-url]: https://travis-ci.org/moovie/moovie
[build-img]: https://travis-ci.org/moovie/moovie.svg?branch=master
