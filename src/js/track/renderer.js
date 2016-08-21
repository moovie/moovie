import { WebVTT } from 'vtt.js';

const Renderer = new Class({
    Implements: [Events, Options],

    options: {
        'bottom': 0,
        'left': 0,
        'pointer-events': 'none',
        'position': 'absolute',
        'right': 0,
        'top': 0
    },

    initialize: function (context, instance, options) {
        this.context = context;
        this.media = instance.video;
        this.textTracks = instance.textTracks;
        this.process = this.process.bind(this);
        this.setOptions(options);
        this.build().enable();
    },

    build: function () {
        this.element = new Element('div');
        this.element.setStyles(this.options);

        return this;
    },

    attach: function () {
        this.media.addEvent('timeupdate', this.process);

        return this;
    },

    detach: function () {
        this.media.removeEvent('timeupdate', this.process);

        return this;
    },

    enable: function () {
        this.disabled = false;
        this.element.setStyle('display', 'block');
        this.attach();

        return this;
    },

    disable: function () {
        this.disabled = true;
        this.element.setStyle('display', 'none');
        this.detach();

        return this;
    },

    process: function () {
        WebVTT.processCues(
            this.context,
            this.textTracks.map((track) => {
                return track.activeCues;
            }).flatten(),
            this.element
        );

        return this;
    },

    toElement: function () {
        return this.element;
    }
});

export default Renderer;
