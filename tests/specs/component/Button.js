import expect from 'expectations';
import sinon from 'sinon';
import Button from '../../../src/js/component/Button.js';
import Base from '../../../src/js/component/Base.js';

describe('Button', function () {
    it('gets exported as a default module', function () {
        expect(Button).toBeDefined();
    });

    it('extends the `Base` base class', function () {
        const testButton = new Button('Test button', Function.from());

        expect(instanceOf(testButton, Base)).toBe(true);
    });

    context('when creating a new instance', function () {
        it('throws a TypeError if the label is not a string', function () {
            const testButton = function () {
                return new Button(4, Function.from());
            };

            expect(testButton).toThrow('`label` must be a string');
        });

        it('has a label', function () {
            const label = 'Test button';
            const testButton = new Button(label, Function.from());
            const buttonElement = document.id(testButton);

            expect(testButton.label).toEqual(label);
            expect(buttonElement.get('aria-label')).toEqual(label);
        });

        it('throws a TypeError if action is not a function', function () {
            const testButton = function () {
                return new Button('Test button', 'a function');
            };

            expect(testButton).toThrow('`action` must be a function');
        });

        it('is enabled by default', function () {
            const testButton = new Button('Test button', Function.from());
            const buttonElement = document.id(testButton);

            expect(testButton.disabled).toBe(false);
            expect(buttonElement.get('aria-disabled')).toEqual('false');
        });

        it('is visible by default', function () {
            const testButton = new Button('Test button', Function.from());
            const buttonElement = document.id(testButton);

            expect(testButton.hidden).toBe(false);
            expect(buttonElement.hasAttribute('hidden')).toBe(false);
        });

        it('has the correct tag', function () {
            const testButton = new Button('Test button', Function.from());
            const buttonElement = document.id(testButton);

            expect(buttonElement.get('tag')).toEqual('button');
        });

        it('has the correct class', function () {
            const testButton = new Button('Test button', Function.from());
            const buttonElement = document.id(testButton);

            expect(buttonElement.hasClass('moovie-button')).toBe(true);
        });
    });

    context('when clicking the button', function () {
        it('calls the specified action', function () {
            const action = sinon.spy();
            const testButton = new Button('Test button', action);

            testButton.click();

            expect(action.called).toBe(true);
        });

        it('gets passed the button as an argument', function () {
            const action = sinon.spy();
            const testButton = new Button('Test button', action);

            testButton.click();

            expect(action.calledWith(testButton)).toBe(true);
        });

        it('provides the button as the action\'s context', function () {
            const action = sinon.spy();
            const testButton = new Button('Test button', action);

            testButton.click();

            expect(action.calledOn(testButton)).toBe(true);
        });
    });
});
