/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import { basename } from './Utility.js';

/**
 * Manages lists of videos inside of Moovie.
 *
 * @todo This class seriously violates SRP and needs to be
 *       refactored into a `Playlist` and a `PlaylistViewer`
 *       class. Or something to that effect, anyway.
 * @type {Class}
 */
const Playlist = new Class({
    Implements: [Events, Options],

    /**
     * options.onShow = function () {}
     * options.onHide = function () {}
     * options.onSelect = function (current) {}
     */
    options: {},

    /**
     * Creates a new `Playlist` instance.
     * @param  {Array} items A list of items.
     * @return {undefined}
     */
    initialize: function (items) {
        this.items = typeOf(items) === 'array' ? items : [];
        this.items.forEach(this.fixItem);
        this.index = this.items.length ? 0 : -1;
        this.displayIndex = this.index;
        this.size = this.items.length;
        this.skippedItems = [];
        this.build().hide();
        this.bindListeners().attach();
    },

    /**
     * Fix inconsistencies in playlist item objects.
     * @param  {Object} item  A playlist item.
     * @param  {Number} index This index of the playlist item.
     * @return {undefined}
     */
    fixItem: function (item, index) {
        item.index = index;
        item.title = item.title || basename(item.src, '.' + item.src.split('.').pop()).capitalize();
        item.summary = item.summary || 'Move along people. There\'s nothing to see here.';
        item.tracks = Array.convert(item.tracks);
    },

    /**
     * Bind the methods used by the event handlers, to the current instance.
     * @return {Playlist} The current instance for method chaining.
     */
    bindListeners: function () {
        this.handlePress = this.handlePress.bind(this);
        this.handleChange = this.handleChange.bind(this);
        this.hide = this.hide.bind(this);
        this.displayPreviousItem = this.displayPreviousItem.bind(this);
        this.displayNextItem = this.displayNextItem.bind(this);

        return this;
    },

    /**
     * Attach event listeners, enabling the playlist panel to be used.
     * @return {Playlist} The current instance for method chaining.
     */
    attach: function () {
        this.closeButton.addEvent('click', this.hide);
        this.domItems.addEvent('click:relay(li button)', this.handlePress);
        this.domItems.addEvent('click:relay(li .moovie-checkbox)', this.handleChange);
        this.previousButton.addEvent('click', this.displayPreviousItem);
        this.nextButton.addEvent('click', this.displayNextItem);

        return this;
    },

    /**
     * Detach event listeners, preventing the playlist panel from being used.
     * @return {Playlist} The current instance for method chaining.
     */
    detach: function () {
        this.closeButton.removeEvent('click', this.hide);
        this.domItems.removeEvent('click:relay(li button)', this.handlePress);
        this.domItems.removeEvent('click:relay(li .moovie-checkbox)', this.handleChange);
        this.previousButton.removeEvent('click', this.displayPreviousItem);
        this.nextButton.removeEvent('click', this.displayNextItem);

        return this;
    },

    /**
     * Builds the DOM structure that will be injected into the browser.
     * @return {Playlist} The current instance for method chaining.
     */
    build: function () {
        this.header = new Element('header[html=<h2>Playlist</h2>]');
        this.element = new Element('div.moovie-panel.playlist-panel');
        this.closeButton = new Element('button.close[text=✖]');
        this.domItems = new Element('ol');
        this.previousButton = new Element('button.previous[text=«]');
        this.nextButton = new Element('button.next[text=»]');

        this.items.each((item) => {
            this.domItems.grab(new Element('li', {
                'data-index': item.index,
                'class': this.current() === item ? 'active' : '',
                'html': this.getTemplate(item)
            }));
        });

        this.element.adopt(this.header, this.closeButton, this.domItems, this.previousButton, this.nextButton);

        return this;
    },

    /**
     * Gets the HTML template markup to be used by each playlist item.
     * @param  {Object} item The playlist item.
     * @return {String} The template string for playlist item markup.
     */
    getTemplate: function (item) {
        return `<img class="poster" src="${item.poster}" alt="${item.title}">
            <div class="content">
                <h3 class="title">${item.title}</h3>
                <p class="summary">${item.summary}</p>
                <button type="button">Play Video</button>
                <input class="moovie-checkbox" type="checkbox" id="mpi${item.index}" checked>
                <label class="moovie-label" for="mpi${item.index}">Add to Queue</label>
            </div>`;
    },

    /**
     * Get the element associated with the current item.
     * @return {Element} [description]
     */
    active: function () {
        return this.domItems.getElement('li.active');
    },

    /**
     * Show the playlist panel.
     * @return {Playlist} The current instance for method chaining.
     */
    show: function () {
        this.hidden = false;
        this.element.removeAttribute('hidden');
        this.fireEvent('show');

        return this;
    },

    /**
     * Hide the playlist panel.
     * @return {Playlist} The current instance for method chaining.
     */
    hide: function () {
        this.hidden = true;
        this.element.set('hidden', '');
        this.fireEvent('hide');

        return this;
    },

    /**
     * Retrieve the current playlist item.
     * @return {Object} [description]
     */
    current: function () {
        return this.items[this.index] || null;
    },

    /**
     * Checks for the next available index, between the first item and the current item.
     * @return {Number|null} Either the index if one can be found, or `null` otherwise.
     */
    getPreviousIndex: function () {
        let index = this.index;

        while (index > 0) {
            index = index - 1;

            if (this.skippedItems.contains(index)) {
                continue;
            }

            return index;
        }

        return null;
    },

    /**
     * Checks if there is another item before the current item.
     * @return {Boolean} `true` if there is, otherwise `false`.
     */
    hasPrevious: function () {
        return this.getPreviousIndex() !== null;
    },

    /**
     * Selects the next available item before the currently selected item.
     * @return {Playlist} The current instance for method chaining.
     */
    previous: function () {
        return this.select(this.getPreviousIndex());
    },

    /**
     * Checks for the next available index, between the last item and the current item.
     * @return {Number|null} Either the index if one can be found, or `null` otherwise.
     */
    getNextIndex: function () {
        let index = this.index;

        while (index < this.items.length - 1) {
            index = index + 1;

            if (this.skippedItems.contains(index)) {
                continue;
            }

            return index;
        }

        return null;
    },

    /**
     * Checks if there is another item after the current item.
     * @return {Boolean} `true` if there is, otherwise `false`.
     */
    hasNext: function () {
        return this.getNextIndex() !== null;
    },

    /**
     * Selects the next available item after the currently selected item.
     * @return {Playlist} The current instance for method chaining.
     */
    next: function () {
        return this.select(this.getNextIndex());
    },

    /**
     * Select an item by it's index.
     * @param  {Number} index The index of the item in question.
     * @return {Playlist} The current instance for method chaining.
     */
    select: function (index) {
        if (typeOf(index) === 'number' && (index >= 0 && index < this.items.length)) {
            this.index = index;
            this.active().removeClass('active');
            this.domItems.getElement(`li[data-index="${index}"]`).addClass('active');
            this.fireEvent('select', this.current());
        }

        return this;
    },

    /**
     * Convert the class to an element for use in DOM operations.
     * @return {Element} The "playlist" element.
     */
    toElement: function () {
        return this.element;
    },

    /**
     * Handles the "click" event on the "play video" button.
     * @param  {Object} event The "click" event.
     * @return {undefined}
     */
    handlePress: function (event) {
        const item = event.target.getParent('li');
        const index = item.get('data-index').toInt();

        event.stop();
        this.select(index).hide();
    },

    /**
     * Handles the "click" event on the "Add to queue" checkbox.
     * @param  {Object} event The "click" event.
     * @return {undefined}
     */
    handleChange: function (event) {
        const item = event.target.getParent('li');
        const action = event.target.checked ? 'erase' : 'include';
        const index = item.get('data-index').toInt();

        this.skippedItems[action](index);
        this.fireEvent('queuechange');
    },

    /**
     * Display the next item in the playlist panel.
     * @return {undefined}
     */
    displayNextItem: function () {
        if (this.displayIndex < this.items.length - 1) {
            this.displayItem(++this.displayIndex);
        }
    },

    /**
     * Display the previous item in the playlist panel.
     * @return {undefined}
     */
    displayPreviousItem: function () {
        if (this.displayIndex > 0) {
            this.displayItem(--this.displayIndex);
        }
    },

    /**
     * Display an item by it's index in the playlist panel.
     * @param  {Number} index The index of the item.
     * @return {undefined}
     */
    displayItem: function (index) {
        // make sure carousel item stays in sync with currently selected item
        if (this.displayIndex !== index) {
            this.displayIndex = index;
        }

        index = index === 0 ? '0' : -Math.abs(index) + '00';
        this.domItems.getChildren('li').setStyle('transform', `translateX(${index}%)`);

        this.previousButton.set('disabled', false);
        this.nextButton.set('disabled', false);

        if (this.displayIndex === 0) {
            this.previousButton.set('disabled', true);
        }

        if (this.displayIndex === this.items.length - 1) {
            this.nextButton.set('disabled', true);
        }
    }
});

export default Playlist;
