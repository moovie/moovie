/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import { basename } from './Utility.js';

/**
 * Manages lists of videos inside of Moovie.
 * @type {Class}
 */
const Playlist = new Class({
    Implements: [Events, Options],

    options: {/*
        onShow: function () {},
        onHide: function () {},
        onSelect: function () {},*/
    },

    initialize: function (items) {
        this.items = typeOf(items) === 'array' ? items : [];
        this.index = this.items.length ? 0 : -1;
        this.displayIndex = this.index;
        this.build().hide();
        this.bindListeners().attach();
    },

    bindListeners: function () {
        this.handle = this.handle.bind(this);
        this.displayPreviousItem = this.displayPreviousItem.bind(this);
        this.displayNextItem = this.displayNextItem.bind(this);

        return this;
    },

    attach: function () {
        this.previousButton.addEvent('click', this.displayPreviousItem);
        this.nextButton.addEvent('click', this.displayNextItem);
        this.itemList.addEvent('click:relay(.checkbox-widget)', this.handle);

        return this;
    },

    displayNextItem: function () {
        if (this.displayIndex < this.listItems.length - 1) {
            this.displayItem(++this.displayIndex);
        }
    },

    displayPreviousItem: function () {
        if (this.displayIndex > 0) {
            this.displayItem(--this.displayIndex);
        }
    },

    displayItem: function (index) {
        //if (this.displayIndex !== index) {
            index = index === 0 ? '0' : -Math.abs(index) + '00';
            this.listItems.setStyle('transform', `translateX(${index}%)`);
        //}

        return this;
    },

    detach: function () {
        this.previousButton.removeEvent('click', this.displayPreviousItem);
        this.nextButton.removeEvent('click', this.displayNextItem);
        this.itemList.removeEvent('click:relay(.checkbox-widget)', this.handle);

        return this;
    },

    build: function () {
        this.element = new Element('div.moovie-playlist');
        this.itemList = new Element('ol');
        this.items.each((item, index) => {
            this.itemList.grab(new Element('li', {
                'data-index': index,
                'class': this.current() === item ? 'active' : '',
                'html': `<div class="checkbox-widget" data-checked="true">
                    <div class="checkbox"></div>
                    <div class="label">${item.title || basename(item.src)}</div>
                </div>`
            }));
        });

        this.previousButton = new Element('div.previous[text=<]');
        this.nextButton = new Element('div.next[text=>]');
        this.element.adopt(
            new Element('h1[text=Playlist]'),
            this.itemList,
            this.previousButton,
            this.nextButton
        );

        this.listItems = this.itemList.getElements('li');

        return this;
    },

    active: function () {
        return this.itemList.getElement('li.active');
    },

    show: function () {
        this.hidden = false;
        this.element.set('aria-hidden', false);
        this.fireEvent('show');

        return this;
    },

    hide: function () {
        this.hidden = true;
        this.element.set('aria-hidden', true);
        this.fireEvent('hide');

        return this;
    },

    size: function () {
        return this.items.length;
    },

    current: function () {
        return this.items[this.index] || null;
    },

    hasPrevious: function () {
        return this.index > 0;
    },

    previous: function () {
        return this.select(this.index - 1);
    },

    hasNext: function () {
        return this.index < this.items.length - 1;
    },

    next: function () {
        return this.select(this.index + 1);
    },

    select: function (index) {
        if (index >= 0 && index < this.items.length) {
            this.index = index;
            this.active().removeClass('active');
            this.itemList.getElement(`li[data-index="${index}"]`).addClass('active');
            this.fireEvent('select', this.current());
        }

        return this;
    },

    isHidden: function () {
        return this.hidden;
    },

    toElement: function () {
        return this.element;
    },

    handle: function (event) {
        const item = event.target.getParent('li');
        const index = item.get('data-index').toInt();

        event.stop();
        this.select(index);
        this.hide();
    }
});

export { Playlist as default };
