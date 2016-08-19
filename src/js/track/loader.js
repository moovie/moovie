/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import { WebSRT } from './websrt.js';
import { WebVTT } from 'vtt.js';

/**
 * Loads and parses the track based on the filetype.
 * @type {Class}
 */
const Loader = new Class({
    initialize: function (url, onCue) {
        this.url = url;
        this.onCue = onCue;
        this.readyState = 0;
        this.sendRequest();
    },

    sendRequest: function () {
        // @todo sort out crossorigin attribute/property as well...
        const request = new Request({
            url: this.url,

            onProgress: () => {
                this.readyState = 1;
            },

            onSuccess: (data) => {
                const parser = this.getParser(this.url.split('.').pop());

                parser.oncue = (cue) => {
                    this.onCue(cue);
                };

                parser.onparsingerror = () => {
                    this.readyState = 3;
                };

                parser.onflush = () => {
                    this.readyState = 2;
                };

                parser.parse(data);
                parser.flush();
                this.readyState = 1;
            },

            onError: () => {
                this.readyState = 3;
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
