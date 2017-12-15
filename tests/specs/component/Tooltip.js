import expect from 'expectations';
import Tooltip from '../../../src/js/component/Tooltip.js';
import Base from '../../../src/js/component/Base.js';

describe('Tooltip', function () {
    it('gets exported as a default module', function () {
        expect(Tooltip).toBeDefined();
    });

    it('extends the `Base` class', function () {
        const target = new Element('button');
        const tooltip = new Tooltip(target);

        expect(instanceOf(tooltip, Base)).toEqual(true);
    });
});
