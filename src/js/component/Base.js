/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import EventTarget from 'event-target-shim';

const disabled = Symbol('disabled');
const hidden = Symbol('hidden');
const element = Symbol('element');
const bound = Symbol('bound');
const defaultOptions = {
    disabled: false,
    hidden: false
};

export default class Base extends EventTarget {
    /**
     * Indicates when the component is in the "disabled" state.
     * @type {Boolean}
     */
    get disabled() {
        return this[disabled];
    }

    /**
     * Indicates when the component is in the "hidden" state.
     * @type {Boolean}
     */
    get hidden() {
        return this[hidden];
    }

    /**
     * Initializes the child class into a working state. This
     * MUST be called by child classes.
     * @abstract
     * @protected
     * @constructor
     * @param  {Object} options Additional options to configure instance.
     * @return {Base} The constructed class.
     */
    constructor(options = defaultOptions) {
        super();

        if (this.constructor === Base) {
            throw new Error('Abstract base class `Base` cannot be instantiated directly.');
        }

        this[element] = this.build();

        if (!this[element]) {
            throw new Error('The `build()` must return an element.');
        }

        this[options.disabled ? 'disable' : 'enable']();
        this[options.hidden ? 'hide' : 'show']();
    }

    /**
     * Create the component's DOM structure.
     * @abstract
     * @protected
     * @return {Element} The base element of the component's structure.
     */
    build() {
        throw new Error('The `build()` method must be implemented by a child class.');
    }

    /**
     * Enables the component.
     * @return {Base} The current instance for method chaining.
     */
    enable() {
        this[disabled] = false;
        this[element].set('aria-disabled', false);

        if (typeof this.attach === 'function') {
            this.attach();
        }

        return this;
    }

    /**
     * Disables the component.
     * @return {Base} The current instance for method chaining.
     */
    disable() {
        this[disabled] = true;
        this[element].set('aria-disabled', true);

        if (typeof this.detach === 'function') {
            this.detach();
        }

        return this;
    }

    /**
     * Shows the element in the DOM.
     * @fires Base#show
     * @return {Base} The current instance for method chaining.
     */
    show() {
        this[hidden] = false;
        this[element].removeAttribute('hidden');
        this.dispatchEvent(new CustomEvent('show'));

        return this;
    }

    /**
     * Hides the element in the DOM.
     * @fires Base#hide
     * @return {Base} The current instance for method chaining.
     */
    hide() {
        this[hidden] = true;
        this[element].setAttribute('hidden', '');
        this.dispatchEvent(new CustomEvent('hide'));

        return this;
    }

    /**
     * Converts the class to an element representation for use in DOM operations.
     * @return {Element} The element created by the `build()` method.
     */
    toElement() {
        return this[element];
    }

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
    getBound(methodName) {
        if (!(methodName in this[bound])) {
            this[bound][methodName] = this[methodName].bind(this);
        }

        return this[bound][methodName];
    }
}
