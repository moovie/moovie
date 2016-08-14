/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Currently supported HTML5 media events.
 *
 * @version 0.4.3
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
const Debugger = new Class({
    Implements: [Options],

    options: {
        disabled: false,
        monitorProperties: [
            'autoplay',
            'controls',
            'currentSrc',
            'currentTime',
            'duration',
            'ended',
            'error',
            'loop',
            'muted',
            'networkState',
            'paused',
            'playbackRate',
            'preload',
            'readyState',
            'seeking',
            'volume'
        ]
    },

    initialize: function (video, options) {
        this.video = document.id(video);
        this.setOptions(options);
        this.bound = this.getBoundEvents();
        this.build();
        this[this.options.disabled ? 'disable' : 'enable']();
    },

    build: function () {
        this.element = new Element('div.debug');
        this.elements = {
            table: new Element('table'),
            tbody: new Element('tbody'),
            p: new Element('p[text=Debugger ready...]')
        };

        this.options.monitorProperties.each(function (el) {
            var row = new Element('tr[data-property=' + el + ']');
            var label = new Element('td[text=' + el + ']');
            var value = new Element('td[text=' + this.video[el] + ']');

            row.adopt(label, value);
            this.elements.tbody.grab(row);
        }, this);

        this.elements.table.grab(this.elements.tbody);
        this.element.adopt(this.elements.table, this.elements.p);

        return this;
    },

    attach: function () {
        this.video.addEvents(this.bound);

        return this;
    },

    detach: function () {
        this.video.removeEvents(this.bound);

        return this;
    },

    enable: function () {
        this.disabled = false;
        this.element.set('aria-disabled', false);

        return this.attach();
    },

    disable: function () {
        this.disabled = true;
        this.element.set('aria-disabled', true);

        return this.detach();
    },

    flashProperty: function (property, value) {
        this.elements.tbody
            .getElement('[data-property=' + property + '] > td + td')
            .set('text', value || this.video[property])
            .getParent().highlight();

        return this;
    },

    flashMessage: function (message) {
        this.elements.p.set('html', message).highlight();

        return this;
    },

    toElement: function () {
        return this.element;
    },

    getBoundEvents: function () {
        return {
            loadstart: function () {
                this.flashProperty('networkState')
                    .flashMessage('looking for data...');
            }.bind(this),

            progress: function () {
                this.flashProperty('networkState')
                    .flashMessage('fetching data...');
            }.bind(this),

            suspend: function () {
                this.flashProperty('networkState')
                    .flashMessage('data fetching suspended...');
            }.bind(this),

            abort: function () {
                this.flashProperty('networkState')
                    .flashMessage('data fetching aborted...');
            }.bind(this),

            error: function () {
                this.flashProperty('networkState')
                    .flashProperty('error', this.video.error.code)
                    .flashMessage('an error occurred while fetching data...');
            }.bind(this),

            emptied: function () {
                this.flashProperty('networkState')
                    .flashMessage('media resource is empty...');
            }.bind(this),

            stalled: function () {
                this.flashProperty('networkState')
                    .flashMessage('stalled while fetching data...');
            }.bind(this),

            loadedmetadata: function () {
                this.flashProperty('readyState')
                    .flashMessage('duration and dimensions have been determined...');
            }.bind(this),

            loadeddata: function () {
                this.flashProperty('readyState')
                    .flashMessage('first frame is available...');
            }.bind(this),

            waiting: function () {
                this.flashProperty('readyState')
                    .flashMessage('waiting for more data...');
            }.bind(this),

            playing: function () {
                this.flashProperty('readyState')
                    .flashMessage('playback has started...');
            }.bind(this),

            canplay: function () {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played, but will likely be interrupted for buffering...');
            }.bind(this),

            canplaythrough: function () {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played and will most likely play through without stopping...');
            }.bind(this),

            play: function () {
                this.flashProperty('paused');
            }.bind(this),

            pause: function () {
                this.flashProperty('paused');
            }.bind(this),

            ended: function () {
                this.flashProperty('paused')
                    .flashProperty('ended');
            }.bind(this),

            timeupdate: function () {
                this.flashProperty('currentTime', this.video.currentTime.round(3));
            }.bind(this),

            seeking: function () {
                this.flashProperty('seeking');
            }.bind(this),

            seeked: function () {
                this.flashProperty('seeking');
            }.bind(this),

            durationchange: function () {
                this.flashProperty('duration', this.video.duration.round(3));
            }.bind(this),

            ratechange: function () {
                this.flashProperty('playbackRate');
            }.bind(this),

            volumechange: function () {
                this.flashProperty('muted')
                    .flashProperty('volume', this.video.volume.round(2));
            }.bind(this)
        };
    }
});

export { Debugger as default };
