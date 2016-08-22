/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import Enum from 'emune';

/**
 * Global events used by the `<video>` tag.
 * @enum {string}
 * @readonly
 */
const MediaEvents = new Enum({
    abort: 'abort',
    canplay: 'canplay',
    canplaythrough: 'canplaythrough',
    durationchange: 'durationchange',
    emptied: 'emptied',
    ended: 'ended',
    error: 'error',
    loadeddata: 'loadeddata',
    loadedmetadata: 'loadedmetadata',
    loadstart: 'loadstart',
    pause: 'pause',
    play: 'play',
    playing: 'playing',
    progress: 'progress',
    ratechange: 'ratechange',
    seeked: 'seeked',
    seeking: 'seeking',
    stalled: 'stalled',
    suspend: 'suspend',
    timeupdate: 'timeupdate',
    volumechange: 'volumechange',
    waiting: 'waiting'
});

// Add HTML5 media events to MooTools, if needed.
if (!Element.NativeEvents.timeupdate) {
    Element.NativeEvents = Object.merge(Element.NativeEvents, MediaEvents);
}

export default MediaEvents;
