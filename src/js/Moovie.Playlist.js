/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Allows manipulation of a collection of videos.
 *
 * @version 0.3.4
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Playlist = new Class({
    initialize: function (items) {
        this.items = typeOf(items) === 'array' ? items : [];
        this.index = this.items.length ? 0 : -1;
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
        if (this.items[this.index--]) {
            return this.current();
        }

        return null;
    },

    hasNext: function () {
        return this.index < this.items.length - 1;
    },

    next: function () {
        if (this.items[this.index++]) {
            return this.current();
        }

        return null;
    },

    select: function (index) {
        if (index >= 0 && index < this.items.length) {
            this.index = index;
        }
    }
});
