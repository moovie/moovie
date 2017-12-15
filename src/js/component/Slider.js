/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import { isInDOM } from '../Utility.js';
import Base from './Base.js';

/**
 * A soon to be UI component for creating aria-enabled sliders.
 * @class
 */
const Slider = new Class({
    Extends: Base,

    /**
     * @inheritdoc
     */
    options: {
        value: 0,
        min: 0,
        max: 100,
        orientation: 'horizontal'
    },

    /**
     * @inheritdoc
     */
    initialize: function (options) {
        this.parent(options);
        this.axis = this.options.orientation === 'vertical' ? 'y' : 'x';
        this.dimensionModifier = this.axis === 'y' ? 'height' : 'width';
        this.positionModifier = this.axis === 'y' ? 'bottom' : 'left';
        this.dragging = false;

        isInDOM(this.element, () => {
            this.update(this.options.value);
        });
    },

    /**
     * @inheritdoc
     */
    build: function () {
        const element = new Element('div.moovie-slider');

        this.track = new Element('div.slider-track');
        this.fill = new Element('div.slider-fill');
        this.thumb = new Element('div.slider-thumb');
        element.set('aria-orientation', this.options.orientation);
        element.adopt(this.track, this.fill, this.thumb);

        return element;
    },

    /**
     * Attach event listeners, this allows the slider to be dragged.
     * @return {Slider} The current instance for method chaining.
     */
    attach: function () {
        this.element.addEvent('mousedown', this.getBound('start'));

        return this;
    },

    /**
     * Detach event listeners, this prevents the slider from being dragged.
     * @return {Slider} The current instance for method chaining.
     */
    detach: function () {
        this.element.removeEvent('mousedown', this.getBound('start'));

        return this;
    },

    /**
     * Handles the "mousedown" event.
     * @param  {object} event The "mousedown" event.
     * @return {Boolean} Stop event propagation and default action.
     */
    start: function (event) {
        if (event.rightClick) {
            return false;
        }

        document.addEvent('mousemove', this.getBound('move'));
        document.addEvent('mouseup', this.getBound('stop'));

        this.setPositionFromEvent(event);
        this.setValueFromPosition(this.position);

        this.dragging = true;
        this.fireEvent('start', [this.value, this.position]);

        return false;
    },

    /**
     * Handles the "mousemove" event.
     * @param  {object} event The "mousemove" event.
     */
    move: function (event) {
        this.setPositionFromEvent(event);
        this.setValueFromPosition(this.position);
        this.fireEvent('move', [this.value, this.position]);
    },

    /**
     * Handles the "mouseup" event.
     */
    stop: function () {
        document.removeEvent('mousemove', this.getBound('move'));
        document.removeEvent('mouseup', this.getBound('stop'));

        this.dragging = false;
        this.fireEvent('stop', [this.value, this.position]);
    },

    /**
     * Update the position of the slider's thumb/fill bar.
     * @param  {number} value A float value between `options.min` and `options.max`.
     * @return {Slider} The current instance for method chaining.
     */
    update: function (value) {
        this.setValue(value);
        this.setPositionFromValue(this.value);

        return this;
    },

    /**
     * Converts a value from one range into a value from another range.
     * @param  {number} oldMin The lower threshold of the old range.
     * @param  {number} oldMax The upper threshold of the old range.
     * @param  {number} newMin The lower threshold of the new range.
     * @param  {number} newMax The upper threshold of the new range.
     * @param  {number} value  The value of the old range.
     * @return {number} The value of the new range.
     */
    toNewRange: function (oldMin, oldMax, newMin, newMax, value) {
        const oldRange = oldMax - oldMin;
        const newRange = newMax - newMin;
        const ratio = newRange / oldRange;

        return (value * ratio) + newMin;
    },

    /**
     * Set the slider's value from the position of the thumb/fill bar.
     * @param {number} position A value between `0` and the slider's track size.
     */
    setValueFromPosition: function (position) {
        const limit = this.track.getSize()[this.axis];

        this.setValue(this.toNewRange(0, limit, this.options.min, this.options.max, position));
    },

    /**
     * Set the slider's thumb/fill bar position from an arbitrary value.
     * @param {number} value A value between `options.min` and `options.max`.
     */
    setPositionFromValue: function (value) {
        const limit = this.track.getSize()[this.axis];

        this.setPosition(this.toNewRange(this.options.min, this.options.max, 0, limit, value));
    },

    /**
     * Sets the position of the thumb/fill bar based on the mouses' position within the document.
     * @param {object} event Either a "mousedown" or a "mousemove" event.
     */
    setPositionFromEvent: function (event) {
        const limit = this.track.getSize()[this.axis];
        const position = event.page[this.axis] - this.track.getPosition()[this.axis];

        this.setPosition(this.axis === 'y' ? limit - position : position);
    },

    /**
     * Set the position of the thumb/fill bar.
     * @param {number} position A value between `0` and the slider's track size.
     */
    setPosition: function (position) {
        const limit = this.track.getSize()[this.axis];

        this.position = position.limit(0, limit);
        this.fill.setStyle(this.dimensionModifier, this.position);
        this.thumb.setStyle(this.positionModifier, this.position);
        this.fireEvent('update', this.position);
    },

    /**
     * Set the slider's value.
     * @param {number} value A value between `options.min` and `options.max`.
     */
    setValue: function (value) {
        this.value = value.limit(this.options.min, this.options.max);
        this.fireEvent('change', this.value);
    }
});

export default Slider;
