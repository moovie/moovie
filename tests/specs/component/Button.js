import expect from 'expectations';
import sinon from 'sinon';
import Button from '../../../src/js/component/Button.js';
import Base from '../../../src/js/component/Base.js';

describe('Button', function () {
    it('gets exported as a default module', function () {
        expect(Button).toBeDefined();
    });

    it('extends the `Base` base class', function () {
        const button = new Button('Test button', Function.from());

        expect(button instanceof Base).toBe(true);
    });

    context('creating a new button', function () {
        it('throws an error if label is not a string', function () {
            const error = new TypeError('`label` must be a string');

            const callback = function () {
                return new Button(4, Function.from());
            };

            expect(callback).toThrow(error);
        });

        it('has a label', function () {
            const label = 'Test button';
            const button = new Button(label, Function.from());
            const element = button.toElement();

            expect(button.label).toEqual(label);
            expect(element.getAttribute('aria-label')).toEqual(label);
        });

        it('throws an error if action is not a function', function () {
            const error = new TypeError('`action` must be a function');

            const callback = function () {
                return new Button('Test button', 'a function');
            };

            expect(callback).toThrow(error);
        });

        it('is enabled by default', function () {
            const button = new Button('Test button', Function.from());
            const element = button.toElement();

            expect(button.disabled).toBe(false);
            expect(element.getAttribute('aria-disabled')).toEqual('false');
        });

        it('is visible by default', function () {
            const button = new Button('Test button', Function.from());
            const element = button.toElement();

            expect(button.hidden).toBe(false);
            expect(element.hasAttribute('hidden')).toBe(false);
        });

        it('has the correct tag', function () {
            const button = new Button('Test button', Function.from());
            const element = button.toElement();

            expect(element.get('tag')).toEqual('button');
        });

        it('has the correct class', function () {
            const button = new Button('Test button', Function.from());
            const element = button.toElement();

            expect(element.hasClass('moovie-button')).toBe(true);
        });
    });

    context('clicking the button', function () {
        it('calls the specified action', function () {
            const action = sinon.spy();
            const button = new Button('Test button', action);

            button.press();

            expect(action.calledOnce).toBe(true);
        });

        it('is passed the instance as an argument to the action', function () {
            const action = sinon.spy();
            const button = new Button('Test button', action);

            button.press();

            expect(action.calledWith(button)).toBe(true);
        });

        it('provides the instance as the action\'s context', function () {
            const action = sinon.spy();
            const button = new Button('Test button', action);

            button.press();

            expect(action.calledOn(button)).toBe(true);
        });
    });
});
