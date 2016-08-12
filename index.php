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
        <video id="avatar" src="http://colinaarts.com/assets/avatar.ogv" poster="http://colinaarts.com/assets/avatar.png" controls>
            <track kind="subtitles" src="assets/avatar (2008).vtt" srclang="en" label="English 1">
            <track kind="subtitles" src="assets/avatar (2008).srt" srclang="en" label="English 2">
            <p>Your browser does not support the HTML 5 <code>video</code> element.</p>
        </video>

        <script src="vendor/mootools/dist/mootools-core.min.js"></script>
        <script src="vendor/mootools-more/Source/Types/URI.js"></script>
        <script src="vendor/mootools-more/Source/Drag/Drag.js"></script>
        <script src="vendor/mootools-more/Source/Interface/Tips.js"></script>
        <script src="vendor/mootools-more/Source/Element/Element.Measure.js"></script>
        <script src="vendor/screenfull/dist/screenfull.min.js"></script>
        <script src="vendor/vtt.js/vtt.min.js"></script>
        <script src="dist/moovie.js"></script>
        <script>
            (function () {
                $$('video').toMoovie({
                    debugger: true,
                    autohideControls: false,
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
            })();
        </script>
    </body>
</html>
