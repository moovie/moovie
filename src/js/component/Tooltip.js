/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */

/**
 * Component for creating aria-enabled tooltip elements.
 * @type {Class}
 */
const Tooltip = new Class({
    Implements: [Events, Options],

    options: {/*
        onShow: function () {},
        onHide: function () {},*/
        hidden: true,
        disabled: false,
        axis: 'both',   // 'none', x', 'y', 'both'
        content: function (element) {
            // condition
            return element.get('aria-label');
        }
    },

    /**
     * Creates a new instance of `Tooltip`.
     * @param  {Element} target [description]
     * @param  {Object} options An object hash of options to further customize the Tooltip.
     * @return {undefined}
     */
    initialize: function (target, options) {
        this.target = document.id(target);
        this.setOptions(options);
        this.build().bindListeners();
        this[this.options.disabled ? 'disable' : 'enable']();
        this[this.options.hidden ? 'hide' : 'show']();
    },

    /**
     * Bind the methods used by the event handlers to the current instance.
     * @return {Tooltip} The current instance for method chaining.
     */
    bindListeners: function () {
        this.update = this.update.bind(this);
        this.hide = this.hide.bind(this);

        return this;
    },

    /**
     * Builds the DOM structure that will be injected into the browser.
     * @return {Tooltip} The current instance for method chaining.
     */
    build: function () {
        this.element = new Element('div', {
            'class': 'moovie-tooltip',
            'aria-hidden': this.options.hidden,
            'aria-disabled': this.options.disabled,
            'role': 'tooltip'
        });

        return this;
    },

    /**
     * Attach event listeners.
     * @return {Tooltip} The current instance for method chaining.
     */
    attach: function () {
        this.target.addEvent('mousemove', this.update);
        this.target.addEvent('mouseleave', this.hide);

        return this;
    },

    /**
     * Detach event listeners.
     * @return {Tooltip} The current instance for method chaining.
     */
    detach: function () {
        this.target.removeEvent('mousemove', this.update);
        this.target.removeEvent('mouseleave', this.hide);

        return this;
    },

    /**
     * Allows the tooltip to track the mouse or autoshow when hovering over a target.
     * @return {Tooltip} The current instance for method chaining.
     */
    enable: function () {
        this.disabled = false;
        this.element.set('aria-disabled', false);
        this.attach();

        return this;
    },

    /**
     * Prevent the tooltip from tracking the mouse or autoshowing when hovering over a target.
     * @return {Tooltip} The current instance for method chaining.
     */
    disable: function () {
        this.disabled = true;
        this.element.set('aria-disabled', true);
        this.detach().hide();

        return this;
    },

    /**
     * Shows the tooltip.
     * @return {Tooltip} The current instance for method chaining.
     */
    show: function () {
        this.hidden = false;
        this.element.set('aria-hidden', false);
        this.fireEvent('show');

        return this;
    },

    /**
     * Hides the tooltip
     * @return {Tooltip} The current instance for method chaining.
     */
    hide: function () {
        this.hidden = true;
        this.element.set('aria-hidden', true);
        this.fireEvent('hide');

        return this;
    },

    /**
     * Convert the class to an element representation for use in DOM operations.
     * @return {Element} The "tooltip" element.
     */
    toElement: function () {
        return this.element;
    },

    /**
     * Handles the "mousemove" event.
     * @param  {Object} event The "mousemove" event.
     * @return {undefined}
     */
    update: function (event) {
        const content = this.options.content.call(this, event.target);

        if (content) {
            this.element.set('html', content);

            if (['x', 'both'].contains(this.options.axis)) {
                this.element.setStyle('left', event.page.x - this.target.getLeft());
            }

            if (['y', 'both'].contains(this.options.axis)) {
                this.element.setStyle('top', event.page.y - this.target.getTop());
            }

            this.show();
        } else {
            this.hide();
        }
    }
});

export default Tooltip;
