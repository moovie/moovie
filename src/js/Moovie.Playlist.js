/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Allows manipulation of a collection of videos.
 *
 * @version 0.4.2
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Playlist = new Class({
    Implements: [Events, Options],

    options: {/*
        onShow: function () {},
        onHide: function () {},
        onSelect: function () {},*/
    },

    initialize: function (items) {
        this.items = typeOf(items) === 'array' ? items : [];
        this.index = this.items.length ? 0 : -1;
        this.build().attach().hide();
    },

    attach: function () {
        var self = this;

        this.element.addEvent('click:relay(.label)', function (e) {
            e.stop();

            var item = this.getParents('li')[0];
            var index = item.get('data-index').toInt();

            self.select(index);
            self.hide();
        });

        return this;
    },

    build: function () {
        this.element = new Element('div.playlist');

        this.element.set('html', '\
            <div><div class="heading">Playlist</div></div>\
            <div><ol class="playlist"></ol></div>\
        ');

        this.items.each(function(el, index) {
            this.element.getElement('ol.playlist')
                .grab(new Element('li', {
                    'data-index': index,
                    'class': this.current() === el ? 'active' : '',
                    'html': '\
                      <div class="checkbox-widget" data-checked="true">\
                        <div class="checkbox"></div>\
                        <div class="label">' + (el.title || Moovie.Util.basename(el.src)) + '</div>\
                      </div>\
                    '
                }));
        }, this);

        return this;
    },

    active: function () {
        return this.element.getElement('ol.playlist li.active');
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
            this.element.getElement('ol.playlist li[data-index="' + index + '"]').addClass('active');
            this.fireEvent('select', this.current());
        }

        return this;
    },

    isHidden: function () {
        return this.hidden;
    },

    toElement: function () {
        return this.element;
    }
});
