/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import { WebSRT } from './WebSRT.js';
import { WebVTT } from 'vtt.js';

/**
 * Loads and parses the track based on the filetype.
 * @type {Class}
 */
const Loader = new Class({
    initialize: function (url, srclang, onCue) {
        this.url = url;
        this.srclang = srclang;
        this.onCue = onCue;
        this.sendRequest();
    },

    sendRequest: function () {
        const request = new Request({
            url: this.url,

            onSuccess: (data) => {
                const parser = this.getParser(this.url.split('.').pop());

                parser.oncue = (cue) => {
                    this.onCue(cue);
                };

                parser.parse(data);
                parser.flush();
            }
        });

        request.send();
    },

    getParser: function (ext) {
        if (ext === 'srt') {
            return new WebSRT.Parser();
        } else if (ext === 'vtt') {
            return new WebVTT.Parser(window, WebVTT.StringDecoder());
        }

        throw new Error(`Unsupported file type: ${ext}`);
    }
});

export default Loader;
