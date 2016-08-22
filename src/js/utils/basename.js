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
const basename = function (path, suffix) {
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
};

export { basename as default };
