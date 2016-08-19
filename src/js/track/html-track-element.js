/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import TextTrack from './text-track.js';
import Loader from './loader.js';

/**
 * Provides a basic implementation of the W3C HTMLTrackElement IDL.
 * @see https://w3c.github.io/html/semantics-embedded-content.html#htmltrackelement-htmltrackelement
 * @param {[type]} trackElement [description]
 */
const HTMLTrackElement = function HTMLTrackElement(trackElement) {
    const textTrack = new TextTrack(trackElement);
    const loader = new Loader(
        trackElement.get('src'),
        function (cue) {
            textTrack.addCue(cue);
        }
    );

    Object.defineProperties(trackElement, {
        kind: {
            get: function () {
                return this.get('kind') || textTrack.kind;
            },
            set: function (kind) {
                this.set('kind', kind);
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
                return loader.readyState;
            }
        },

        track: {
            get: function () {
                return textTrack;
            }
        },

        // You can check to see if a <track> element was
        // polyfilled by Moovie, by checking for this property.
        $track: {
            value: true,
            writeable: false
        }
    });

    return trackElement;
};

export default HTMLTrackElement;
