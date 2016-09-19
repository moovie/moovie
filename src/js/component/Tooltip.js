/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import Component from '../core/Component.js';

/**
 * UI component for creating aria-enabled tooltip elements.
 * @class
 */
const Tooltip = new Class({
    Extends: Component,

    /**
     * @inheritdoc
     */
    options: {
        hidden: true,

        // 'none' || 'x' || 'y' || 'both'
        axis: 'both',

        // called everytime the tooltip is shown
        content: function (element) {
            return element.get('aria-label');
        }
    },

    /**
     * @inheritdoc
     * @param {Element} target The element to use as the trigger for the tooltip.
     */
    initialize: function (target, options) {
        this.target = document.id(target);
        this.parent(options);
    },

    /**
     * @inheritdoc
     */
    build: function () {
        return new Element('div', {
            'class': 'moovie-tooltip',
            'role': 'tooltip'
        });
    },

    /**
     * Attach event listeners.
     * @return {Tooltip} The current instance for method chaining.
     */
    attach: function () {
        this.target.addEvent('mousemove', this.getBound('update'));
        this.target.addEvent('mouseleave', this.getBound('hide'));

        return this;
    },

    /**
     * Detach event listeners.
     * @return {Tooltip} The current instance for method chaining.
     */
    detach: function () {
        this.target.removeEvent('mousemove', this.getBound('update'));
        this.target.removeEvent('mouseleave', this.getBound('hide'));

        return this;
    },

    /**
     * Handles the "mousemove" event.
     * @param  {Object} event The "mousemove" event.
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

Component.register('tooltip', Tooltip);

export default Tooltip;
