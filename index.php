<!DOCTYPE html>

<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Moovie Demo</title>
        <link href="dist/moovie.css" rel="stylesheet">

        <style>
            body {
                background-image: url("chrome://global/skin/media/imagedoc-darknoise.png");
            }
        </style>
    </head>
    <body>
        <video src="http://colinaarts.com/assets/avatar.ogv" poster="http://colinaarts.com/assets/avatar.png" controls>
            <track kind="subtitles" src="assets/avatar (2008).vtt" srclang="en" label="English" default>
            <p>Your browser does not support the HTML 5 <code>video</code> element.</p>
        </video>

        <script src="vendor/mootools/dist/mootools-core.min.js"></script>
        <script src="vendor/mootools-more/Source/Types/URI.js"></script>
        <script src="vendor/mootools-more/Source/Drag/Drag.js"></script>
        <script src="vendor/mootools-more/Source/Interface/Tips.js"></script>
        <script src="vendor/screenfull/dist/screenfull.min.js"></script>
        <script src="dist/moovie.js"></script>
        <script src="http://colinaarts.com/js/avatar.mc"></script>
        <script>
            (function () {
                var videos = $$('video');

                if (videos.length && videos[0].play) {
                    var video = {
                        'video': videos[0],
                        'id': 'avatar',
                        'options': {

                        'debugger': true,
                        'playlist': [
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
                        }
                    };

                    Moovie([video]);
                }
            })();
        </script>
    </body>
</html>
