/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Commonly used functions for the Moovie library.
 *
 * @version 0.3.2
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Util = { // eslint-disable-line
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
    }
};
