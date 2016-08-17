/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Provides an SRTCue object for the WebSRT parser. While the SRT standard
 * doesn't really support any of the VTT properties, it does make it easier to
 * process both .srt and .vtt inside Moovie when vtt.js uses the same cue type.
 *
 * @link https://github.com/mozilla/vtt.js
 * @version 0.4.4
 * @author vtt.js Contributors (https://github.com/mozilla/vtt.js/blob/master/AUTHORS)
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import { VTTCue } from 'vtt.js';

const SRTCue = VTTCue;

export { SRTCue as default };
