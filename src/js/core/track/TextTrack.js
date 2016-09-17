/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import TextTrackKind from './TextTrackKind.js';
import TextTrackMode from './TextTrackMode.js';

/**
 * An implementation of the W3C TextTrack IDL.
 * @class TextTrack
 */
const TextTrack = (function () {
    // Simple hack to make constructor private when called directly.
    let initializing = false;

    // Actual constructor for `TextTrack` objects.
    const TextTrack = function TextTrack(kind, label, language) {
        const cues = [];
        const activeCues = [];
        let mode = TextTrackMode.disabled;

        if (!initializing) {
            throw new TypeError('Illegal constructor.');
        }

        initializing = false;

        if (!(kind in TextTrackKind)) {
            kind = 'metadata';
        }

        Object.defineProperties(this, {
            kind: {
                get: function () {
                    return kind;
                }
            },

            label: {
                get: function () {
                    return label;
                }
            },

            language: {
                get: function () {
                    return language;
                }
            },

            id: {
                get: function () {
                    return '';
                }
            },

            inBandMetadataTrackDispatchType: {
                get: function () {
                    return '';
                }
            },

            mode: {
                get: function () {
                    return mode;
                },

                set: function (value) {
                    if (value in TextTrackMode) {
                        mode = value;
                    }
                }
            },

            cues: {
                get: function () {
                    return cues;
                }
            },

            activeCues: {
                get: function () {
                    return activeCues;
                }
            },

            addCue: {
                value: function (cue) {
                    cues.push(cue);
                }
            },

            removeCue: {
                value: function (cue) {
                    cues.remove(cue);
                }
            },

            oncuechange: {
                value: function () {
                    // do nothing
                }
            }
        });
    };

    /**
     * Creates polyfilled `TextTrack` objects.
     * @param  {TextTrackKind} [kind='subtitles'] The type of text track being created.
     * @param  {String} [label=''] A label to be displayed by the User-Agent for the track.
     * @param  {String} [language=''] A BCP-47 language string.
     * @return {TextTrack} A new `TextTrack` object.
     */
    TextTrack.create = function (kind = 'subtitles', label = '', language = '') {
        initializing = true;

        return new TextTrack(kind, label, language);
    };

    return TextTrack;
})();

// Pollute our polyfilled `TextTrack` object.
window.TextTrack = TextTrack;

export default TextTrack;
