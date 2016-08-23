import sinon from 'sinon';
import Checkbox from '../../../src/js/component/Checkbox.js';

describe('Checkbox', function () {
    describe('#initialize(name, options)', function () {
        it('has a name', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(checkbox.name).toEqual('checkbox-1');
            expect(document.id(checkbox).get('data-name')).toEqual('checkbox-1');
        });

        it('defaults to the "unchecked" state', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(checkbox.isChecked()).toBe(false);
            expect(document.id(checkbox).get('aria-checked')).toEqual('false');
        });

        it('can override the default state', function () {
            const checkbox = new Checkbox('checkbox-1', {
                checked: true
            });

            expect(checkbox.isChecked()).toBe(true);
            expect(document.id(checkbox).get('aria-checked')).toEqual('true');
        });
    });

    describe('#build()', function () {
        it('builds the element with the correct tag', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(document.id(checkbox).get('tag')).toEqual('div');
        });

        it('builds the element with the correct CSS class', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(document.id(checkbox).hasClass('moovie-checkbox')).toBe(true);
        });

        it('can be chained', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(checkbox.build()).toBe(checkbox);
        });

        it('builds the element with a label', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(document.id(checkbox).get('data-label')).toEqual('checkbox-1');
        });

        it('can build the element with a custom label', function () {
            const checkbox = new Checkbox('checkbox-1', { label: 'my awesome checkbox!' });

            expect(document.id(checkbox).get('data-label')).toEqual('my awesome checkbox!');
        });
    });

    describe('#check()', function () {
        it('updates the state in the class', function () {
            const checkbox = new Checkbox('checkbox-1');

            checkbox.check();

            expect(checkbox.isChecked()).toBe(true);
        });

        it('updates the state on the element', function () {
            const checkbox = new Checkbox('checkbox-1');

            checkbox.check();

            expect(document.id(checkbox).get('aria-checked')).toEqual('true');
        });

        it('fires an event', function () {
            const checkbox = new Checkbox('checkbox-1');
            const spy = sinon.spy();

            checkbox.addEvent('check', spy);
            checkbox.check();

            expect(spy.called).toBe(true);
        });

        it('can be chained', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(checkbox.check()).toBe(checkbox);
        });
    });

    describe('#uncheck()', function () {
        it('updates the state in the class', function () {
            const checkbox = new Checkbox('checkbox-1');

            checkbox.uncheck();

            expect(checkbox.isChecked()).toBe(false);
        });

        it('updates the state on the element', function () {
            const checkbox = new Checkbox('checkbox-1');

            checkbox.uncheck();

            expect(document.id(checkbox).get('aria-checked')).toEqual('false');
        });

        it('fires an event', function () {
            const checkbox = new Checkbox('checkbox-1');
            const spy = sinon.spy();

            checkbox.addEvent('uncheck', spy);
            checkbox.uncheck();

            expect(spy.called).toBe(true);
        });

        it('can be chained', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(checkbox.uncheck()).toBe(checkbox);
        });
    });

    describe('#toElement()', function () {
        it('returns an element', function () {
            const checkbox = new Checkbox('checkbox-1');

            expect(typeOf(checkbox.toElement())).toEqual('element');
        });
    });
});
