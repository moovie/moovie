/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Provides a basic implementation of the W3C HTMLTrackElement IDL.
 *
 * @version 0.4.2
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
// import window from 'global/window';
import TextTrack from './TextTrack.js';
import { WebVTT } from 'vtt.js';
import WebSRT from './WebSRT.js';
import TextTrackKind from './TextTrackKind';

// @todo sort out crossorigin attribute/property as well...
const HTMLTrackElement = function HTMLTrackElement(trackElement) {
    var readyState = 0;
    var textTrack = new TextTrack(trackElement);    // sets up defaults from attributes and gets media element
    var request = new Request({
        url: trackElement.get('src'),
        // onLoading: function () {readyState = 1;},
        onSuccess: function (data) {
            var parser;

            if (trackElement.get('src').split('.').pop() === 'srt') {
                parser = new WebSRT.Parser();
            } else {
                parser = new WebVTT.Parser(window, WebVTT.StringDecoder());
            }

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

    request.send();

    Object.defineProperties(trackElement, {
        kind: {
            get: function () {
                return this.get('kind') || textTrack.kind;  // missing value default (retrieved from TextTrack obj)
            },
            set: function (kind) {
                if (TextTrackKind.contains(kind)) {
                    this.set('kind', kind);
                } else {
                    this.set('kind', 'metadata');   // invalid value default
                }
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
            get: function () {
                return 0;
            }
        },

        LOADING: {
            get: function () {
                return 1;
            }
        },

        LOADED: {
            get: function () {
                return 2;
            }
        },

        ERROR: {
            get: function () {
                return 3;
            }
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
        }
    });

    // You can check to see if a <track> element has been
    // polyfilled by Moovie, by checking for this property.
    trackElement.$track = true;

    return trackElement;
};

export { HTMLTrackElement as default };
