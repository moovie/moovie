import expect from 'expectations';
import sinon from 'sinon';
import Base from '../../../src/js/component/Base.js';

let mockElement = null;
class ComponentMock extends Base { build() { return mockElement; } }

describe('Base', function () {
    beforeEach(function () {
        mockElement = new Element('div#test');
    });

    it('is a default export', function () {
        expect(Base).toBeDefined();
    });

    describe('#constructor', function () {
        it('cannot be instantiated directly', function () {
            const expectedError = new Error('Abstract base class `Base` cannot be instantiated directly.');

            const errorThrown = function () {
                return new Base();
            };

            expect(errorThrown).toThrow(expectedError);
        });

        it('throws an error if a child class does not implement the `build()` method', function () {
            class ComponentMock extends Base {}
            const expectedError = new Error('The `build()` method must be implemented by a child class.');

            const errorThrown = function () {
                return new ComponentMock();
            };

            expect(errorThrown).toThrow(expectedError);
        });

        it("throws an error if the `build()` method doesn't return an element", function () {
            class ComponentMock extends Base { build() {} }
            const expectedError = new Error('The `build()` must return an element.');

            const errorThrown = function () {
                return new ComponentMock();
            };

            expect(errorThrown).toThrow(expectedError);
        });

        it('defaults to the "enabled" state', function () {
            const instance = new ComponentMock();
            const element = instance.toElement();

            expect(instance.disabled).toBe(false);
            expect(element.getAttribute('aria-disabled')).toEqual('false');
        });

        it('defaults to the "showing" state', function () {
            const instance = new ComponentMock();
            const element = instance.toElement();

            expect(instance.hidden).toBe(false);
            expect(element.hasAttribute('hidden')).toBe(false);
        });

        it('can be disabled by providing the "disabled" option', function () {
            const instance = new ComponentMock({ disabled: true });
            const element = instance.toElement();

            expect(instance.disabled).toBe(true);
            expect(element.getAttribute('aria-disabled')).toEqual('true');
        });

        it('can be hidden by providing the "hidden" option', function () {
            const instance = new ComponentMock({ hidden: true });
            const element = instance.toElement();

            expect(instance.hidden).toBe(true);
            expect(element.hasAttribute('hidden')).toBe(true);
        });
    });

    describe('#disable', function () {
        it('can be chained', function () {
            const instance = new ComponentMock();
            const returnValue = instance.disable();

            expect(returnValue).toBe(instance);
        });

        it('updates the "disabled" property', function () {
            const instance = new ComponentMock({ disabled: false });

            instance.disable();

            expect(instance.disabled).toBe(true);
        });

        it('updates the "aria-disabled" attribute', function () {
            const instance = new ComponentMock({ disabled: false });
            const element = instance.toElement();

            instance.disable();

            expect(element.getAttribute('aria-disabled')).toEqual('true');
        });

        it('calls the detach() method if defined', function () {
            const instance = new ComponentMock({ disabled: false });
            const spy = sinon.spy();

            instance.detach = spy;
            instance.disable();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#enable', function () {
        it('can be chained', function () {
            const instance = new ComponentMock();
            const returnValue = instance.enable();

            expect(returnValue).toBe(instance);
        });

        it('updates the "disabled" property', function () {
            const instance = new ComponentMock({ disabled: true });

            instance.enable();

            expect(instance.disabled).toBe(false);
        });

        it('updates the "aria-disabled" attribute on the element', function () {
            const instance = new ComponentMock({ disabled: true });
            const element = instance.toElement();

            instance.enable();

            expect(element.getAttribute('aria-disabled')).toEqual('false');
        });

        it('calls the attach() method if defined', function () {
            const instance = new ComponentMock({ disabled: true });
            const spy = sinon.spy();

            instance.attach = spy;
            instance.enable();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#show', function () {
        it('can be chained', function () {
            const instance = new ComponentMock();
            const returnValue = instance.show();

            expect(returnValue).toBe(instance);
        });

        it('updates the "hidden" property', function () {
            const instance = new ComponentMock({ hidden: true });

            instance.show();

            expect(instance.hidden).toBe(false);
        });

        it('removes the "hidden" attribute from the element', function () {
            const instance = new ComponentMock({ hidden: true });
            const element = instance.toElement();

            instance.show();

            expect(element.hasAttribute('hidden')).toBe(false);
        });

        it('fires a "show" event', function () {
            const instance = new ComponentMock({ hidden: true });
            const spy = sinon.spy();

            instance.addEventListener('show', spy);
            instance.show();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#hide', function () {
        it('can be chained', function () {
            const instance = new ComponentMock();
            const returnValue = instance.hide();

            expect(returnValue).toBe(instance);
        });

        it('updates the "hidden" property', function () {
            const instance = new ComponentMock({ hidden: false });

            instance.hide();

            expect(instance.hidden).toBe(true);
        });

        it('adds a "hidden" attribute to the element', function () {
            const instance = new ComponentMock({ hidden: false });
            const element = instance.toElement();

            instance.hide();

            expect(element.hasAttribute('hidden')).toBe(true);
        });

        it('fires a "hide" event', function () {
            const instance = new ComponentMock({ hidden: false });
            const spy = sinon.spy();

            instance.addEventListener('hide', spy);
            instance.hide();

            expect(spy.calledOnce).toBe(true);
        });
    });

    describe('#toElement', function () {
        it('returns the element created by the build() method', function () {
            const instance = new ComponentMock();
            const returnValue = instance.toElement();

            expect(returnValue).toBe(mockElement);
        });
    });
});
