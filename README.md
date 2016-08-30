# ![Moovie](http://colinaarts.com/assets/code/moovie/moovie.png)

[![Build Status][build-img]][build-url]

An advanced HTML5 video player for MooTools.

## Installation

You can include Moovie in your own project with [npm](https://www.npmjs.com/):

```bash
$ npm install moovie
```

Or include Moovie directly in your page using the [unpkg](https://npmcdn.com/#/) cdn:

```html
<!-- with your own copy of MooTools... -->
<script src="//vendor/mootools/mootools-core.min.js"></script>
<script src="https://npmcdn.com/moovie?main=browser"></script>
```

```html
<!-- or bundled with MooTools... -->
<script src="https://npmcdn.com/moovie?main=main"></script>
```

Alternatively, if you must, you can install Moovie using [Bower](https://bower.io/) as well:

```bash
$ bower install https://npmcdn.com/moovie/bower.zip
```

**Important Notes:**
- *Installing with npm includes its own copy of MooTools. This can cause conflicts with other libraries when creating a web application in node.*
- *Bower has MooTools setup as a dependency in its configuration file.*

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
<video src="video.mp4" poster="video.png">
    <track kind="subtitles" src="subs.srt" srclang="en" label="English" default="">
</video>
```

## Contributing

> Please see [CONTRIBUTING](CONTRIBUTING.md).

## <a name="license"></a>License

> Copyright &copy; 2010 [Colin Aarts](colin@colinaarts.com)
>
> Please see [LICENSE](LICENSE.md) for more information.

[build-url]: https://travis-ci.org/moovie/moovie
[build-img]: https://travis-ci.org/moovie/moovie.svg?branch=master
