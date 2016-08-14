/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Provides a basic implementation of the W3C TextTrack IDL.
 *
 * @version 0.4.3
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import TextTrackKind from './TextTrackKind';
import TextTrackMode from './TextTrackMode';

const TextTrack = function TextTrack(trackElement) {
    var kind = '';
    var label = '';
    var mode = 'disabled';
    var language = '';
    var id = '';
    var inBandMetadataTrackDispatchType = '';
    var cues = [];
    var activeCues = [];
    var media = trackElement.getParent('video');

    if (!kind) {
        kind = 'subtitles'; // missing value default
    } else if (!TextTrackKind.contains(kind)) {
        kind = 'metadata';  // invalid value default
    }

    media.addEvent('timeupdate', function () {
        var processingTime = 0.39;
        var time = media.currentTime + processingTime;
        var i;
        var l;
        var cue;

        for (i = 0, l = activeCues.length; i < l; i++) {
            cue = activeCues[i];

            if (cue.startTime > time || cue.endTime < time) {
                activeCues.splice(i, 1);
                i--;

                if (cue.pauseOnExit) {
                    media.pause();
                }

                // cueexit
            }
        }

        for (i = 0, l = cues.length; i < l; i++) {
            cue = cues[i];

            if ((cue.startTime <= time) && (cue.endTime >= time) && !activeCues.contains(cue)) {
                //if (mode == 'showing' || mode == 'hidden') {
                activeCues.push(cue);
                // cueenter
                //}
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
            value: function () {}
        }
    });
};

export { TextTrack as default };
