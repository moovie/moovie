
/**
 * Base class that all UI components must extend.
 * @abstract
 * @class
 */
const Component = new Class({
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
     * @return {Component} The constructed class.
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
     * @return {Component} The current instance for method chaining.
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
     * @return {Component} The current instance for method chaining.
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
     * @fires Component#show
     * @return {Component} The current instance for method chaining.
     */
    show: function () {
        this.hidden = false;
        this.element.erase('hidden');
        this.fireEvent('show');

        return this;
    },

    /**
     * Hides the element in the DOM.
     * @fires Component#hide
     * @return {Component} The current instance for method chaining.
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
    getBound: function(methodName) {
        if (!(methodName in this.bound)) {
            this.bound[methodName] = this[methodName].bind(this);
        }

        return this.bound[methodName];
    }.protect()
});

/**
 * Hash of all registered components.
 * @private
 * @readonly
 * @type {Object}
 */
Component.registered = {};

/**
 * Used to create registered sub-components.
 * @param  {String} name Name of the sub-component.
 * @param  {Array} args Arguments to pass to constructor of sub-component.
 * @return {Component} A new instance of `name`.
 */
Component.create = function (name, ...args) {
    if (!(name in Component.registered)) {
        throw new Error(`Component "${name}" could not be found.`);
    }

    return new Component.registered[name](...args);
};

/**
 * Registers a new component with Moovie.
 * @param  {String} name A unique name for the component being registered.
 * @param  {Component} component The class representing the component.
 * @return {undefined}
 */
Component.register = function (name, component) {
    if (!name) {
        throw new Error('The component you are trying to register does not have a name.');
    }

    if (name in Component.registered) {
        throw new Error(`Component "${name}" has already been registered.`);
    }

    Component.registered[name] = component;
};

export default Component;
