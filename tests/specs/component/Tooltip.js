import expect from 'expectations';
import Tooltip from '../../../src/js/component/Tooltip.js';
import Component from '../../../src/js/core/Component.js';

describe('Tooltip', function () {
    it('gets exported as a default module', function () {
        expect(Tooltip).toBeDefined();
    });

    it('extends the `Component` class', function () {
        const target = new Element('button');
        const tooltip = new Tooltip(target);

        expect(instanceOf(tooltip, Component)).toEqual(true);
    });

    it('is a registered component', function () {
        const exists = Object.keyOf(Component.registered, Tooltip);

        expect(exists).toEqual('tooltip');
    });
});
