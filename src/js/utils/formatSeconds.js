/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Takes a floating point value and converts into a time string. E.g. from currentTime, duration
 *
 * @version 0.4.2
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */

const parse = function (input) {
    return {
        hh: Math.floor(input / 3600),
        mm: Math.floor(input % 3600 / 60),
        ss: Math.ceil(input % 3600 % 60)
    };
};

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
