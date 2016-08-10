/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Commonly used functions for the Moovie library.
 *
 * @version 0.4.0
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Util = {
    formatTime: function (seconds) {
        var hh = Math.floor(seconds / 3600);
        var mm = Math.floor((seconds % 3600) / 60);
        var ss = Math.ceil((seconds % 3600) % 60);

        if (ss === 60) {
            ss = 0;
            mm = mm + 1;
        }

        if (ss < 10) {
            ss = '0' + ss;
        }

        if (mm === 60) {
            mm = 0;
            hh = hh + 1;
        }

        if (hh > 0 && mm < 10) {
            mm = '0' + mm;
        }

        if (hh === 0) {
            return mm + ':' + ss;
        } else {
            return hh + ':' + mm + ':' + ss;
        }
    },

    /**
     * Strip directory and suffix from filenames.
     *
     * @link http://locutus.io/php/basename/
     * @author Kevin van Zonneveld (http://kvz.io)
     * @author Ash Searle (http://hexmen.com/blog/)
     * @author Lincoln Ramsay
     * @author djmix
     * @author Dmitry Gorelenkov
     * @param  {string} path   [description]
     * @param  {string} suffix If specified, removes suffix from returned string.
     * @return {string}        [description]
     */
    basename: function (path, suffix) {
        var b = path;
        var lastChar = b.charAt(b.length - 1);

        if (lastChar === '/' || lastChar === '\\') {
            b = b.slice(0, -1);
        }

        b = b.replace(/^.*[\/\\]/g, '');

        if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
            b = b.substr(0, b.length - suffix.length);
        }

        return b;
    }
};
