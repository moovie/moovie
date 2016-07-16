<!DOCTYPE html>

<html lang="en">
    <head>
        <meta charset="utf-8">
        <title>Moovie Demo</title>
        <link href="dist/moovie.min.css" rel="stylesheet">

        <style>
            body {
                background-image: url("chrome://global/skin/media/imagedoc-darknoise.png");
            }

            .moovie {
                left: 50%;
                position: absolute;
                top: 50%;
                transform: translate(-50%, -50%);
                width: 852px;
                max-width: 852px;
            }
        </style>
    </head>
    <body>
        <div class="moovie">
            <div class="wrapper">
                <video src="http://colinaarts.com/assets/avatar.ogv" poster="http://colinaarts.com/assets/avatar.png" autobuffer controls>
                    <p>Your browser does not support the HTML 5 <code>video</code> element.</p>
                </video>
            </div>
        </div>

        <script src="vendor/mootools/dist/mootools-core.min.js"></script>
        <script src="vendor/mootools-more/Source/Types/URI.js"></script>
        <script src="vendor/mootools-more/Source/Drag/Drag.js"></script>
        <script src="vendor/mootools-more/Source/Interface/Tips.js"></script>
        <script src="dist/moovie.min.js"></script>
        <script src="http://colinaarts.com/js/avatar.mc"></script>
        <script>
            (function () {
                var videos = $$('video');

                if (videos.length && videos[0].play) {
                    var video = {
                        'video': videos[0],
                        'id': 'avatar',
                        'options': {

                        'debug': true,
                        'playlist': [
                            {
                                'id': 'alice',
                                'src': 'http://http://colinaarts.com/assets/alice.ogv'
                            },
                            {
                                'id': 'shrek',
                                'src': 'http://http://colinaarts.com/assets/shrek.ogv',
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
