/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */

/**
 * Strip directory and suffix from filenames.
 * @link http://locutus.io/php/basename/
 * @author Kevin van Zonneveld (http://kvz.io)
 * @author Ash Searle (http://hexmen.com/blog/)
 * @author Lincoln Ramsay
 * @author djmix
 * @author Dmitry Gorelenkov
 * @param  {string} path   [description]
 * @param  {string} suffix If specified, removes suffix from returned string.
 * @return {string}        [description]
 */
export function basename(path, suffix) {
    let b = path;
    const lastChar = b.charAt(b.length - 1);

    if (lastChar === '/' || lastChar === '\\') {
        b = b.slice(0, -1);
    }

    b = b.replace(/^.*[\/\\]/g, '');

    if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
        b = b.substr(0, b.length - suffix.length);
    }

    return b;
}

/**
 * Converts a floating point value into a time string.
 * @param  {Number} value A floating point value represented as seconds.milliseconds.
 * @return {string} A string formatted to either: hh:mm:ss or mm:ss or m:ss
 */
export function formatSeconds(value) {
    const input = Math.round(value);
    let hours = Math.floor(input / 3600);
    let minutes = Math.floor(input % 3600 / 60);
    let seconds = input % 3600 % 60;

    if (Number.isNaN(value) || !Number.isFinite(value)) {
        return '-:--';
    }

    if (value < 0) {
        return '0:00';
    }

    hours = hours > 0 ? hours + ':' : '';
    minutes = (hours && minutes < 10 ? '0' + minutes : minutes) + ':';
    seconds = seconds < 10 ? '0' + seconds : seconds;

    return hours + minutes + seconds;
}

/**
 * Retrieve attributes from an element.
 * @param  {Element} element An Element instance.
 * @return {Object} An object containing all defined element attributes.
 */
export function getAttributes(element) {
    const attributes = {};

    Array.convert(element.attributes).forEach((attribute) => {
        attributes[attribute.name] = attribute.value;
    });

    return attributes;
}

/**
 * Polls the DOM periodically to check for the existance of an element.
 * @see https://davidwalsh.name/javascript-polling
 * @param  {Element}  element   The Element instance to check for.
 * @param  {Function} onsuccess Called if the element was found before the timeout expired.
 * @param  {Function} onerror   Called if the element was not found and the timeout has expired.
 * @param  {Number}   timeout   How long to poll the DOM for. (Default is 2 seconds)
 * @return {undefined}
 */
export function isInDOM(element, onsuccess, onerror, timeout) {
    const expiry = Date.now() + (timeout || 2000);
    const condition = function () {
        return document.body.contains(element);
    };

    (function poller() {
        // If the condition was met, we're done!
        if (condition()) {
            onsuccess();

        // If the condition wasn't met and the timeout hasn't elapsed, try again.
        } else if (Date.now() < expiry) {
            setTimeout(poller, 100);

        // Condition wasn't matched and too much time elapsed, reject!
        } else {
            onerror(new Error('Element could not be found in DOM before timeout occurred.'));
        }
    })();

    // @todo return Promise
}
