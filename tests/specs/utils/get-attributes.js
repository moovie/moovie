import getAttributes from '../../../src/js/utils/get-attributes.js';

describe('.getAttributes(element)', function () {
    it('returns an empty object if the element has no attributes', function () {
        const element = new Element('div');

        expect(getAttributes(element)).toEqual({});
    });

    it('returns an object with the attribute pairs mapped to the object', function () {
        const element = new Element('div.test[data-name=test-element]');

        expect(getAttributes(element)).toEqual({
            'class': 'test',
            'data-name': 'test-element'
        });
    });
});
