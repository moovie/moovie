/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import Enum from 'emune';

/**
 * W3C TextTrackMode IDL export.
 * @see https://w3c.github.io/html/semantics-embedded-content.html#enumdef-texttrack-texttrackmode
 * @enum {string}
 * @readonly
 */
const TextTrackMode = new Enum({
    disabled: 'disabled',
    hidden: 'hidden',
    showing: 'showing'
});

export default TextTrackMode;
