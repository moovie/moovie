/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */

/**
 * Shows current state of video properties.
 * @type {Class}
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

        this.options.monitorProperties.forEach((property) => {
            const row = new Element(`tr[data-property=${property}]`);
            const label = new Element(`td[text=${property}]`);
            const value = new Element(`td[text=${this.video[property]}]`);

            row.adopt(label, value);
            this.elements.tbody.grab(row);
        });

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
            .getElement(`[data-property=${property}] > td + td`)
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
            loadstart: () => {
                this.flashProperty('networkState')
                    .flashMessage('looking for data...');
            },

            progress: () => {
                this.flashProperty('networkState')
                    .flashMessage('fetching data...');
            },

            suspend: () => {
                this.flashProperty('networkState')
                    .flashMessage('data fetching suspended...');
            },

            abort: () => {
                this.flashProperty('networkState')
                    .flashMessage('data fetching aborted...');
            },

            error: () => {
                this.flashProperty('networkState')
                    .flashProperty('error', this.video.error ? this.video.error.code : null)
                    .flashMessage('an error occurred while fetching data...');
            },

            emptied: () => {
                this.flashProperty('networkState')
                    .flashMessage('media resource is empty...');
            },

            stalled: () => {
                this.flashProperty('networkState')
                    .flashMessage('stalled while fetching data...');
            },

            loadedmetadata: () => {
                this.flashProperty('readyState')
                    .flashMessage('duration and dimensions have been determined...');
            },

            loadeddata: () => {
                this.flashProperty('readyState')
                    .flashMessage('first frame is available...');
            },

            waiting: () => {
                this.flashProperty('readyState')
                    .flashMessage('waiting for more data...');
            },

            playing: () => {
                this.flashProperty('readyState')
                    .flashMessage('playback has started...');
            },

            canplay: () => {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played, but will likely be interrupted for buffering...');
            },

            canplaythrough: () => {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played and will most likely play through without stopping...');
            },

            play: () => {
                this.flashProperty('paused');
            },

            pause: () => {
                this.flashProperty('paused');
            },

            ended: () => {
                this.flashProperty('paused')
                    .flashProperty('ended');
            },

            timeupdate: () => {
                this.flashProperty('currentTime', this.video.currentTime.round(3));
            },

            seeking: () => {
                this.flashProperty('seeking');
            },

            seeked: () => {
                this.flashProperty('seeking');
            },

            durationchange: () => {
                this.flashProperty('duration', this.video.duration.round(3));
            },

            ratechange: () => {
                this.flashProperty('playbackRate');
            },

            volumechange: () => {
                this.flashProperty('muted')
                    .flashProperty('volume', this.video.volume.round(2));
            }
        };
    }
});

export { Debugger as default };
