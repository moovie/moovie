/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Provides a basic implementation of the W3C HTMLTrackElement IDL.
 *
 * @version 0.4.4
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import TextTrack from './TextTrack.js';
import WebSRT from './WebSRT.js';
import TextTrackKind from './TextTrackKind';
import { WebVTT } from 'vtt.js';

const getParser = function (extension) {
    switch (extension) {
        case 'srt':
            return new WebSRT.Parser();

        case 'vtt':
            return new WebVTT.Parser(window, WebVTT.StringDecoder());

        default:
            throw new Error(`Unsupported file type: ${extension}`);
    }
};

// @todo sort out crossorigin attribute/property as well...
const HTMLTrackElement = function HTMLTrackElement(trackElement) {
    let readyState = 0;
    const textTrack = new TextTrack(trackElement);    // sets up defaults from attributes and gets media element
    const request = new Request({
        url: trackElement.get('src'),

        // onLoading: function () {readyState = 1;},

        onSuccess: function (data) {
            const parser = getParser(trackElement.get('src').split('.').pop());

            parser.oncue = function (cue) {
                textTrack.addCue(cue);
            };

            parser.onparsingerror = function () {
                readyState = 3;
            };

            parser.onflush = function () {
                readyState = 2;
            };

            parser.parse(data);
            parser.flush();
            readyState = 1;
        },

        onError: function () {
            readyState = 3;
        }
    });

    // @todo change to Promises
    request.send();

    Object.defineProperties(trackElement, {
        kind: {
            get: function () {
                return this.get('kind') || textTrack.kind;  // missing value default (retrieved from TextTrack obj)
            },
            set: function (kind) {
                this.set('kind', TextTrackKind.contains(kind) ? kind : 'metadata');
            }
        },

        src: {
            get: function () {
                return this.get('src');
            },
            set: function (src) {
                this.set('src', src);
            }
        },

        srclang: {
            get: function () {
                return this.get('srclang');
            },
            set: function (srclang) {
                this.set('src', srclang);
            }
        },

        label: {
            get: function () {
                return this.get('label');
            },
            set: function (label) {
                this.set('label', label);
            }
        },

        default: {
            get: function () {
                return this.hasAttribute('default');
            },
            set: function (isDefault) {
                if (isDefault) {
                    this.setAttribute('default', '');
                } else {
                    this.removeAttribute('default');
                }
            }
        },

        NONE: {
            value: 0,
            writeable: false
        },

        LOADING: {
            value: 1,
            writeable: false
        },

        LOADED: {
            value: 2,
            writeable: false
        },

        ERROR: {
            value: 3,
            writeable: false
        },

        readyState: {
            get: function () {
                return readyState;
            }
        },

        track: {
            get: function () {
                return textTrack;
            }
        },

        // You can check to see if a <track> element has been
        // polyfilled by Moovie, by checking for this property.
        $track: {
            value: true,
            writeable: false
        }
    });

    return trackElement;
};

export { HTMLTrackElement as default };
