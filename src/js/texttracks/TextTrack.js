/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Provides a basic implementation of the W3C TextTrack IDL.
 *
 * @version 0.4.5
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import TextTrackKind from './TextTrackKind';
import TextTrackMode from './TextTrackMode';

const TextTrack = function TextTrack(trackElement) {
    let kind = '';
    let label = '';
    let mode = 'disabled';
    let language = '';
    let id = '';
    let inBandMetadataTrackDispatchType = '';
    const cues = [];
    const activeCues = [];
    const media = trackElement.getParent('video');

    if (!trackElement.get('kind')) {
        kind = 'subtitles'; // missing value default
    } else if (!TextTrackKind.contains(trackElement.get('kind'))) {
        kind = 'metadata';  // invalid value default
    }

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
                return id;
            }
        },

        inBandMetadataTrackDispatchType: {
            get: function () {
                return inBandMetadataTrackDispatchType;
            }
        },

        mode: {
            get: function () {
                return mode;
            },

            set: function (value) {
                if (TextTrackMode.contains(value)) {
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
