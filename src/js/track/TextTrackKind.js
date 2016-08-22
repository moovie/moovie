/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import Enum from 'emune';

/**
 * W3C TextTrackKind IDL export.
 * @see https://w3c.github.io/html/semantics-embedded-content.html#enumdef-texttrack-texttrackkind
 * @enum {string}
 * @readonly
 */
const TextTrackKind = new Enum({
    subtitles: 'subtitles',
    captions: 'captions',
    descriptions: 'descriptions',
    chapters: 'chapters',
    metadata: 'metadata'
});

export default TextTrackKind;
