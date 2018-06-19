/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import SRTCue from './SRTCue.js';

/**
 * Parses SRT (.srt) files.
 * @todo Make parser extend EventTarget.
 */
export class Parser {
    constructor() {
        this.oncue = Function.from();
        this.onflush = Function.from();
        this.onparsingerror = Function.from();
        this.buffer = '';
        this.cues = [];
    }

    parse(data) {
        this.buffer = this.buffer + data;
    }

    flush() {
        const rawCues = this.buffer.replace(/\r?\n/gm, '\n').trim().split('\n\n');

        rawCues.each((rawCueBlock) => {
            const cueLines = rawCueBlock.split('\n');
            const cueid = cueLines.shift();
            const cuetc = cueLines.shift().split(' --> ');
            const cueobj = new SRTCue(
                this.parseTimeStamp(cuetc[0]),
                this.parseTimeStamp(cuetc[1]),
                cueLines.join('\n')
            );

            cueobj.id = cueid;
            this.oncue(cueobj);
        });

        this.onflush();
    }

    /**
     * Timestamp must take the form of [hours]:[minutes]:[seconds],[milliseconds]
     */
    parseTimeStamp(input) {
        const matches = input.match(/^(\d{2}):(\d{2}):(\d{2}),(\d{3})/);

        if (!matches) {
            return null;
        }

        return this.computeSeconds(matches[1], matches[2], matches[3], matches[4]);
    }

    computeSeconds(hours, minutes, seconds, milliseconds) {
        hours = hours.toInt() * 3600;
        minutes = minutes.toInt() * 60;
        seconds = seconds.toInt();
        milliseconds = milliseconds.toInt() / 1000;

        return hours + minutes + seconds + milliseconds;
    }
}

export default { Parser };
