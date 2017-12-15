/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */

/**
 * Base class that all UI components must extend.
 * @abstract
 * @class
 */
const Base = new Class({
    Implements: [Events, Options],

    /**
     * Default options that are merged in with the constructor options.
     * @protected
     * @type {Object}
     */
    options: {
        disabled: false,
        hidden: false
    },

    /**
     * Indicates when the component is in the "disabled" state.
     * @readonly
     * @type {Boolean}
     */
    disabled: false,

    /**
     * Indicates when the component is in the "hidden" state.
     * @readonly
     * @type {Boolean}
     */
    hidden: false,

    /**
     * What is returned when the sub-component is used as an element.
     * @private
     * @readonly
     * @type {Element}
     */
    element: null,

    /**
     * Methods that are bound to the `this` instance.
     * @private
     * @readonly
     * @type {Object}
     */
    bound: {},

    /**
     * Initializes the child class into a working state. This
     * MUST be called by child classes.
     * @abstract
     * @protected
     * @constructor
     * @param  {Object} options Additional options to configure instance.
     * @return {Base} The constructed class.
     */
    initialize: function (options) {
        this.setOptions(options);
        this.element = this.build();

        if (!this.element) {
            throw new Error('The `build()` must return an element.');
        }

        this[this.options.disabled ? 'disable' : 'enable']();
        this[this.options.hidden ? 'hide' : 'show']();
    }.protect(),

    /**
     * Create the component's DOM structure.
     * @abstract
     * @protected
     * @return {Element} The base element of the component's structure.
     */
    build: function () {
        throw new Error('The `build()` method must be implemented by a child class.');
    }.protect(),

    /**
     * Enables the component.
     * @return {Base} The current instance for method chaining.
     */
    enable: function () {
        this.disabled = false;
        this.element.set('aria-disabled', false);

        if (typeOf(this.attach) === 'function') {
            this.attach();
        }

        return this;
    },

    /**
     * Disables the component.
     * @return {Base} The current instance for method chaining.
     */
    disable: function () {
        this.disabled = true;
        this.element.set('aria-disabled', true);

        if (typeOf(this.detach) === 'function') {
            this.detach();
        }

        return this;
    },

    /**
     * Shows the element in the DOM.
     * @fires Base#show
     * @return {Base} The current instance for method chaining.
     */
    show: function () {
        this.hidden = false;
        this.element.erase('hidden');
        this.fireEvent('show');

        return this;
    },

    /**
     * Hides the element in the DOM.
     * @fires Base#hide
     * @return {Base} The current instance for method chaining.
     */
    hide: function () {
        this.hidden = true;
        this.element.set('hidden', '');
        this.fireEvent('hide');

        return this;
    },

    /**
     * Converts the class to an element representation for use in DOM operations.
     * @return {Element} The element created by the `build()` method.
     */
    toElement: function () {
        return this.element;
    },

    /**
     * Retrieves a function bound to the instance. Use with event listeners
     * @protected
     * @example
     * // Binding a method to an event handler.
     * this.element.addEvent('click', this.getBound('handle'));
     *
     * // Removing the same method from the event handler.
     * this.element.removeEvent('click', this.getBound('handle'));
     * @param  {String} methodName The name of the bound method.
     * @return {Function} The bound method.
     */
    getBound: function (methodName) {
        if (!(methodName in this.bound)) {
            this.bound[methodName] = this[methodName].bind(this);
        }

        return this.bound[methodName];
    }.protect()
});

export default Base;
