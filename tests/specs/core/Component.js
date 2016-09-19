import expect from 'expectations';
import sinon from 'sinon';
import Component from '../../../src/js/core/Component.js';

const ComponentMock = new Class({
    Extends: Component,
    initialize: function (...args) {
        this.parent(...args);
    },
    build: function () {
        return new Element('div#test');
    }
});

describe('Component', function () {
    it('gets exported as a default module', function () {
        expect(Component).toBeDefined();
    });

    it('is an abstract class', function () {
        const actual = function () {
            return new Component();
        };

        expect(actual).toThrow(new Error('The method "initialize" cannot be called.'));
    });

    it('throws an error if the child class does not implement the `build()` method', function () {
        const ComponentMock = new Class({
            Extends: Component,
            initialize: function () {
                this.parent();
            }
        });

        const actual = function () {
            return new ComponentMock();
        };

        expect(actual).toThrow(new Error('The `build()` method must be implemented by a child class.'));
    });

    it("throws an error if the `build()` method doesn't return an element", function () {
        const ComponentMock = new Class({
            Extends: Component,
            initialize: function () {
                this.parent();
            },
            build: function () {
                return null;
            }
        });

        const actual = function () {
            return new ComponentMock();
        };

        expect(actual).toThrow(new Error('The `build()` must return an element.'));
    });

    it('can be used like an element', function () {
        const mock = new ComponentMock();
        const mockElement = document.id(mock);

        expect(typeOf(mockElement)).toEqual('element');
        expect(instanceOf(mockElement, HTMLElement)).toBe(true);
    });

    describe('#disable()', function () {
        it('can be chained', function () {
            const mock = new ComponentMock();

            expect(mock.disable()).toBe(mock);
        });

        it('updates the "disabled" property', function () {
            const mock = new ComponentMock({ disabled: false });

            mock.disable();

            expect(mock.disabled).toBe(true);
        });

        it('updates the "aria-disabled" attribute', function () {
            const mock = new ComponentMock({ disabled: false });
            const mockElement = document.id(mock);

            mock.disable();

            expect(mockElement.get('aria-disabled')).toEqual('true');
        });

        it('calls the detach() method if defined', function () {
            const mock = new ComponentMock({ disabled: false });
            const spy = sinon.spy();

            mock.detach = spy;
            mock.disable();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#enable()', function () {
        it('can be chained', function () {
            const mock = new ComponentMock();

            expect(mock.enable()).toBe(mock);
        });

        it('updates the "disabled" property', function () {
            const mock = new ComponentMock({ disabled: true });

            mock.enable();

            expect(mock.disabled).toBe(false);
        });

        it('updates the "aria-disabled" attribute', function () {
            const mock = new ComponentMock({ disabled: true });
            const mockElement = document.id(mock);

            mock.enable();

            expect(mockElement.get('aria-disabled')).toEqual('false');
        });

        it('calls the attach() method if defined', function () {
            const mock = new ComponentMock({ disabled: true });
            const spy = sinon.spy();

            mock.attach = spy;
            mock.enable();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#show()', function () {
        it('can be chained', function () {
            const mock = new ComponentMock();

            expect(mock.show()).toBe(mock);
        });

        it('updates the "hidden" property', function () {
            const mock = new ComponentMock({ hidden: true });

            mock.show();

            expect(mock.hidden).toBe(false);
        });

        it('updates the "hidden" attribute', function () {
            const mock = new ComponentMock({ hidden: true });
            const mockElement = document.id(mock);

            mock.show();

            expect(mockElement.hasAttribute('hidden')).toBe(false);
        });

        it('fires a "show" event', function () {
            const mock = new ComponentMock({ hidden: true });
            const spy = sinon.spy();

            mock.addEvent('show', spy);
            mock.show();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#hide()', function () {
        it('can be chained', function () {
            const mock = new ComponentMock();

            expect(mock.hide()).toBe(mock);
        });

        it('updates the "hidden" property', function () {
            const mock = new ComponentMock({ hidden: false });

            mock.hide();

            expect(mock.hidden).toBe(true);
        });

        it('updates the "hidden" attribute', function () {
            const mock = new ComponentMock({ hidden: false });
            const mockElement = document.id(mock);

            mock.hide();

            expect(mockElement.hasAttribute('hidden')).toBe(true);
        });

        it('fires a "hide" event', function () {
            const mock = new ComponentMock({ hidden: false });
            const spy = sinon.spy();

            mock.addEvent('hide', spy);
            mock.hide();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#initialize(options)', function () {
        it('should be in the "disabled" state if `options.disabled` is true', function () {
            const mock = new ComponentMock({ disabled: true });
            const mockElement = document.id(mock);

            expect(mock.disabled).toBe(true);
            expect(mockElement.get('aria-disabled')).toEqual('true');
        });

        it('should not be in the "disabled" state if `options.disabled` is false', function () {
            const mock = new ComponentMock({ disabled: false });
            const mockElement = document.id(mock);

            expect(mock.disabled).toBe(false);
            expect(mockElement.get('aria-disabled')).toEqual('false');
        });

        it('should be in the "hidden" state if `options.hidden` is true', function () {
            const mock = new ComponentMock({ hidden: true });
            const mockElement = document.id(mock);

            expect(mock.hidden).toBe(true);
            expect(mockElement.hasAttribute('hidden')).toBe(true);
        });

        it('should not be in the "hidden" state if `options.hidden` is false', function () {
            const mock = new ComponentMock({ hidden: false });
            const mockElement = document.id(mock);

            expect(mock.hidden).toBe(false);
            expect(mockElement.hasAttribute('hidden')).toBe(false);
        });
    });
});
