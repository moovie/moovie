/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */

/**
 * Retrieve attributes from an element.
 * @param  {Element} element An Element instance.
 * @return {Object} An object containing all defined element attributes.
 */
const getAttributes = function getAttributes(element) {
    const attributes = {};

    Array.convert(element.attributes).forEach((attribute) => {
        attributes[attribute.name] = attribute.value;
    });

    return attributes;
};

export default getAttributes;
