/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Gives Moovie the ability to support .srt files using <track> elements.
 *
 * @version 0.4.2
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import SRTCue from './SRTCue';

const WebSRT = {};

WebSRT.Parser = new Class({
    initialize: function () {
        this.oncue = function () {};
        this.onflush = function () {};
        this.onparsingerror = function () {};
        this.buffer = '';
        this.cues = [];
    },

    computeSeconds: function (h, m, s, f) {
        return (h | 0) * 3600 + (m | 0) * 60 + (s | 0) + (f | 0) / 1000;
    },

    // Timestamp must take the form of [hours]:[minutes]:[seconds],[milliseconds]
    parseTimeStamp: function (input) {
        var m = input.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

        if (!m) {
            return null;
        }

        return this.computeSeconds(m[1], m[2], m[3], m[4]);
    },

    parse: function (data) {
        this.buffer = this.buffer + data;
    },

    flush: function () {
        var self = this;
        var rawCues = this.buffer.replace(/\r?\n/gm, '\n').trim().split('\n\n');

        rawCues.each(function (cue) {
            cue = cue.split('\n');

            var cueid = cue.shift();
            var cuetc = cue.shift().split(' --> ');
            var cuetx = cue.join('\n');

            cue = new SRTCue(
                self.parseTimeStamp(cuetc[0]),
                self.parseTimeStamp(cuetc[1]),
                cuetx
            );

            cue.id = cueid;

            self.cues.push(cue);
            self.oncue.call(self, cue);
        });

        this.onflush.call(this, self.cues);
    }
});

export { WebSRT as default };
