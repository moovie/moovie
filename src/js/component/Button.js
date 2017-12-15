/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import Base from './Base.js';

/**
 * UI component for creating aria-enabled button elements.
 * @class
 */
const Button = new Class({
    Extends: Base,

    /**
     * @inheritdoc
     */
    options: {},

    /**
     * The label for the button.
     * @readonly
     * @type {String}
     */
    label: '',

    /**
     * The function to call when the button is clicked.
     * @readonly
     * @type {Function}
     */
    action: Function.from(),

    /**
     * @inheritdoc
     * @param {String} label The button's label.
     * @param {Function} action The function to call when the button is clicked.
     * @param {Object} options Additional configuration options.
     */
    initialize: function (label, action, options) {
        if (typeOf(label) !== 'string') {
            throw new TypeError('`label` must be a string');
        }

        if (typeOf(action) !== 'function') {
            throw new TypeError('`action` must be a function');
        }

        this.label = label;
        this.action = action;
        this.parent(options);
    },

    /**
     * @inheritdoc
     */
    build: function () {
        return new Element('button', {
            'class': 'moovie-button',
            'aria-label': this.label
        });
    },

    /**
     * Attach event listeners.
     * @return {Button} The current instance for method chaining.
     */
    attach: function () {
        document.id(this).addEvent('click', this.getBound('click'));

        return this;
    },

    /**
     * Detach event listeners.
     * @return {Button} The current instance for method chaining.
     */
    detach: function () {
        document.id(this).removeEvent('click', this.getBound('click'));

        return this;
    },

    /**
     * Handles the "click" event.
     */
    click: function () {
        this.action.call(this, this);
    }
});

export default Button;
