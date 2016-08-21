
const getAttributes = function getAttributes(element) {
    const attributes = {};

    Array.convert(element.attributes).forEach((attribute) => {
        attributes[attribute.name] = attribute.value;
    });

    return attributes;
};

export default getAttributes;
