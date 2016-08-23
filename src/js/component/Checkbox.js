/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
const Checkbox = new Class({
    Implements: [Events, Options],

    options: {/*
        onCheck: function () {},
        onUncheck: function () {},
        onChange: function () {},*/
        label: '',
        checked: false
    },

    /**
     * Creates a new instance of `Checkbox`.
     * @param  {string} name    The name of the checkbox. This MUST be unique.
     * @param  {object} options An object hash of options to further customize the checkbox.
     * @return {undefined}
     */
    initialize: function (name, options) {
        this.name = name;
        this.setOptions(options);
        this.toggle = this.toggle.bind(this);
        this.build().attach();
        this[this.options.checked ? 'check' : 'uncheck']();
    },

    /**
     * Builds the DOM structure that will be injected into the browser.
     * @return {Checkbox} The current instance for method chaining.
     */
    build: function () {
        this.element = new Element('div', {
            'class': 'moovie-checkbox',
            'data-label': this.options.label || this.name,
            'data-name': this.name
        });

        return this;
    },

    /**
     * Attach event listeners, this allows the checkbox to be toggled.
     * @return {Checkbox} The current instance for method chaining.
     */
    attach: function () {
        this.element.addEvent('click', this.toggle);

        return this;
    },

    /**
     * Detach event listeners, this prevents the checkbox from being toggled.
     * @return {Checkbox} The current instance for method chaining.
     */
    detach: function () {
        this.element.removeEvent('click', this.toggle);

        return this;
    },

    /**
     * Set the checkbox to the "checked" state.
     * @return {Checkbox} The current instance for method chaining.
     */
    check: function () {
        this.checked = true;
        this.element.set('aria-checked', true);
        this.fireEvent('check');

        return this;
    },

    /**
     * Set the checkbox to the "unchecked" state.
     * @return {Checkbox} The current instance for method chaining.
     */
    uncheck: function () {
        this.checked = false;
        this.element.set('aria-checked', false);
        this.fireEvent('uncheck');

        return this;
    },

    /**
     * Convert the class to an element for use in DOM operations.
     * @return {Element} The "checkbox" element.
     */
    toElement: function () {
        return this.element;
    },

    /**
     * Toggle to either the "checked" or "unchecked" state based on the current state.
     * @return {undefined}
     */
    toggle: function () {
        this[this.checked ? 'uncheck' : 'check']().fireEvent('change');
    },

    /**
     * Checks if the checkbox is currently in the "checked" state.
     * @return {boolean} `true` if the checkbox is in the "checked" state.
     */
    isChecked: function () {
        return this.checked;
    }
});

export default Checkbox;
