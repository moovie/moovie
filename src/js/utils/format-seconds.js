/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */

/**
 * Separates a floating point value into different time values.
 * @param  {Number} input A floating point value.
 * @return {Object} An object containg: hh for hours, mm for minutes and ss for seconds.
 */
const parse = function (input) {
    return {
        hh: Math.floor(input / 3600),
        mm: Math.floor(input % 3600 / 60),
        ss: Math.ceil(input % 3600 % 60)
    };
};

/**
 * Converts a floating point value into a time string.
 * @param  {Number} input A floating point value.
 * @return {string} A string formatted to either: hh:mm:ss or mm:ss or m:ss
 */
const format = function (input) {
    let { hh, mm, ss } = parse(input);

    if (ss === 60) {
        ss = 0;
        mm = mm + 1;
    }

    if (ss < 10) {
        ss = '0' + ss;
    }

    if (mm === 60) {
        mm = 0;
        hh = hh + 1;
    }

    if (hh > 0 && mm < 10) {
        mm = '0' + mm;
    }

    if (hh === 0) {
        return `${mm}:${ss}`;
    }

    return `${hh}:${mm}:${ss}`;
};

export { format as default };
