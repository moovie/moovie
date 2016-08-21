/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Provides a basic implementation of the W3C TextTrack IDL.
 *
 * @version 0.4.6
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import TextTrackKind from './text-track-kind.js';
import TextTrackMode from './text-track-mode.js';

const TextTrack = function TextTrack(kind, label, language, media) {
    const cues = [];
    const activeCues = [];
    let mode = TextTrackMode.disabled;

    if (!kind) {
        kind = 'subtitles'; // missing value default
    } else if (!(kind in TextTrackKind)) {
        kind = 'metadata';  // invalid value default
    }

    if (!language) {
        language = 'english';
    }

    if (!label) {
        label = `${kind}-${language}`;
    }

    // @todo disable events when "mode" is equal to "disabled"
    media.addEvent('timeupdate', () => {
        const processingTime = 0.39;
        const time = media.currentTime + processingTime;
        let i = 0;

        // cueexit
        i = activeCues.length;
        while (i--) {
            if (activeCues[i].startTime > time || activeCues[i].endTime < time) {
                if (activeCues[i].pauseOnExit) {
                    media.pause();
                }

                activeCues.splice(i, 1);
            }
        }

        // cueenter
        i = cues.length;
        while (i--) {
            if (cues[i].startTime <= time && cues[i].endTime >= time) {
                activeCues.include(cues[i]);
            }
        }
    });

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
            value: Function.from()
        }
    });
};

export { TextTrack as default };
