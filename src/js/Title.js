/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Currently supported HTML5 media events.
 *
 * @version 0.4.4
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
const Title = new Class({
    Implements: [Events, Options],

    options: {/*
        onShow: function () {},
        onHide: function () {},*/
        autohide: true,
        delay: 6000,
        hidden: true,
        content: ''
    },

    initialize: function (options) {
        this.setOptions(options).build();
        this[this.options.hidden ? 'hide' : 'show']();
    },

    build: function () {
        this.element = new Element('div.moovie-title');
        this.element.set('html', this.options.content);

        return this;
    },

    update: function (content) {
        this.element.set('html', content);

        return this;
    },

    show: function () {
        this.hidden = false;
        this.element.set('aria-hidden', false);
        this.fireEvent('show');

        // prevents a whole host of bugs
        if (this.id) {
            clearTimeout(this.id);  // eslint-disable-line no-undef
        }

        if (this.options.autohide) {
            this.id = this.hide.delay(this.options.delay, this);
        }

        return this;
    },

    hide: function () {
        this.hidden = true;
        this.element.set('aria-hidden', true);
        this.fireEvent('hide');

        return this;
    },

    isHidden: function () {
        return this.hidden;
    },

    toElement: function () {
        return this.element;
    }
});

export { Title as default };
