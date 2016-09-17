/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import EventTarget from 'event-target-shim';

// Surprise, surprise, IE11 doesn't support EventTarget.
if (!window.EventTarget) {
    window.EventTarget = EventTarget;
}

const track = Symbol('track');
const id = Symbol('id');
const startTime = Symbol('startTime');
const endTime = Symbol('endTime');
const pauseOnExit = Symbol('pauseOnExit');

/**
 * An interface for text track cues to implement.
 */
class TextTrackCue extends EventTarget('enter', 'exit') {
    /** @return {TextTrack|null} */
    get track() {
        return this[track];
    }

    /** @param {TextTrack} value A `TextTrack` object. */
    set track(value) {
        this[track] = value;
    }

    /** @return {String} */
    get id() {
        return this[id];
    }

    /** @param {String} value An identifier. */
    set id(value) {
        this[id] = String(value);
    }

    /** @return {Number} The cue's start time expressed as a double. */
    get startTime() {
        return this[startTime];
    }

    /** @param {Number} value The cue's start time expressed as a double. */
    set startTime(value) {
        this[startTime] = Number(value);
    }

    /** @return {Number} The cue's end time expressed as a double. */
    get endTime() {
        return this[endTime];
    }

    /** @param {Number} value The cue's end time expressed as a double. */
    set endTime(value) {
        this[endTime] = Number(value);
    }

    /** @return {Boolean} Returns `true` if the video is to be paused on cue exit. */
    get pauseOnExit() {
        return this[pauseOnExit];
    }

    /** @param {Boolean} value Whether or not the video should pause on cue exit. */
    set pauseOnExit(value) {
        this[pauseOnExit] = Boolean(value);
    }

    /**
     * Constructor can only be called by subclasses.
     * @private
     */
    constructor() {
        super();

        // IE11 doesn't support the `constructor.name` property
        if (this.constructor === TextTrackCue) {
            throw new TypeError('Illegal constructor.');
        }
    }
}

// expose globally
window.TextTrackCue = TextTrackCue;

export default TextTrackCue;
