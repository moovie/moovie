/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import Base from './Base.js';

const symbolForTarget = Symbol('target');
const defaultOptions = {
    hidden: true,

    // 'none' || 'x' || 'y' || 'both'
    axis: 'both',

    // called everytime the tooltip is shown
    content: function () {
        return this.target.getAttribute('aria-label');
    }
};

/**
 * UI component for creating aria-enabled tooltip elements.
 * @class
 */
export default class Tooltip extends Base {
    get target() {
        return this[symbolForTarget];
    }

    /**
     * @inheritdoc
     * @param {Element} target The element to use as the trigger for the tooltip.
     */
    constructor(target, options = defaultOptions) {
        super(options);
        this[symbolForTarget] = target;
        this[this.options.disabled ? 'disable' : 'enable']();
        this[this.options.hidden ? 'hide' : 'show']();
    }

    /**
     * @inheritdoc
     */
    build() {
        return new Element('div', {
            class: 'moovie-tooltip',
            role: 'tooltip'
        });
    }

    /**
     * Attach event listeners.
     * @return {Tooltip} The current instance for method chaining.
     */
    attach() {
        this[symbolForTarget].addEventListener('mousemove', this.getBound('update'));
        this[symbolForTarget].addEventListener('mouseleave', this.getBound('hide'));

        return this;
    }

    /**
     * Detach event listeners.
     * @return {Tooltip} The current instance for method chaining.
     */
    detach() {
        this[symbolForTarget].removeEventListener('mousemove', this.getBound('update'));
        this[symbolForTarget].removeEventListener('mouseleave', this.getBound('hide'));

        return this;
    }

    /**
     * Handles the "mousemove" event.
     * @param  {Object} event The "mousemove" event.
     */
    update(event) {
        const content = this.options.content.call(this, event.target);

        if (content) {
            this.toElement().set('html', content);

            if (['x', 'both'].contains(this.options.axis)) {
                this.toElement().setStyle('left', event.page.x - this[symbolForTarget].getLeft());
            }

            if (['y', 'both'].contains(this.options.axis)) {
                this.toElement().setStyle('top', event.page.y - this[symbolForTarget].getTop());
            }

            this.show();
        } else {
            this.hide();
        }
    }
}
