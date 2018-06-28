/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import Base from './Base.js';

const symbolForLabel = Symbol('label');
const symbolForAction = Symbol('action');
const defaultOptions = {
    label: '',
    action: Function.from()
};

/**
 * UI component for creating aria-enabled button elements.
 * @class
 */
export default class Button extends Base {
    /**
     * The label for the button.
     * @type {String}
     */
    get label() {
        return this[symbolForLabel];
    }

    /**
     * @inheritdoc
     * @param {String} label The button's label.
     * @param {Function} action The function to call when the button is clicked.
     * @param {Object} options Additional configuration options.
     */
    constructor(label, action, options = defaultOptions) {
        super(options);

        if (typeof label !== 'string') {
            throw new TypeError('`label` must be a string');
        }

        if (typeof action !== 'function') {
            throw new TypeError('`action` must be a function');
        }

        this[symbolForLabel] = label;
        this[symbolForAction] = action;
        this.toElement().setAttribute('aria-label', this[symbolForLabel]);
        this[this.options.disabled ? 'disable' : 'enable']();
        this[this.options.hidden ? 'hide' : 'show']();
    }

    /**
     * @inheritdoc
     */
    build() {
        return new Element('button', {
            'class': 'moovie-button',
            'aria-label': ''
        });
    }

    /**
     * Attach event listeners.
     * @return {Button} The current instance for method chaining.
     */
    attach() {
        this.toElement().addEventListener('click', this.getBound('press'));

        return this;
    }

    /**
     * Detach event listeners.
     * @return {Button} The current instance for method chaining.
     */
    detach() {
        this.toElement().removeEventListener('click', this.getBound('press'));

        return this;
    }

    /**
     * Handles the "click" event.
     */
    press() {
        this[symbolForAction].call(this, this);
    }
}
