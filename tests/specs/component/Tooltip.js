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

        expect(tooltip instanceof Base).toBe(true);
    });

    context('when creating a new instance', function () {
        it('is hidden by default', function () {
            const button = new Element('button');
            const tooltip = new Tooltip(button);
            const element = tooltip.toElement();

            expect(tooltip.hidden).toBe(true);
            expect(element.hasAttribute('hidden')).toBe(true);
        });

        it('sets the correct default options', function () {
            const button = new Element('button');
            const tooltip = new Tooltip(button);

            expect(tooltip.options.hidden).toBe(true);
            expect(tooltip.options.axis).toEqual('both');
            expect(tooltip.options.content).toBeDefined();
            expect(typeof tooltip.options.content).toEqual('function');
        });

        it('creates the element with the correct CSS class', function () {
            const button = new Element('button');
            const tooltip = new Tooltip(button);
            const element = tooltip.toElement();

            expect(element.hasClass('moovie-tooltip')).toBe(true);
        });

        it('creates the element with the correct role', function () {
            const button = new Element('button');
            const tooltip = new Tooltip(button);
            const element = tooltip.toElement();

            expect(element.getAttribute('role')).toEqual('tooltip');
        });
    });
});
