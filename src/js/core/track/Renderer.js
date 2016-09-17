/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import { WebVTT } from 'vtt.js';

/**
 * Render active text track cues inside of a DOM element.
 * @class Renderer
 */
const Renderer = new Class({
    Implements: [Events, Options],

    options: {
        // Higher number means show cue faster
        processingDelay: 0.39
    },

    /**
     * Constructs a new text track renderer.
     * @param {Moovie} player The Moovie player instance.
     */
    initialize: function (player, options) {
        this.player = player;
        this.setOptions(options);
        this.processTracks = this.processTracks.bind(this);
        this.build().enable();
    },

    /**
     * Creates the element that will be inserted into the DOM.
     * @return {Renderer} The current instance for method chaining.
     */
    build: function () {
        this.element = new Element('div');
        this.element.setStyles({
            'bottom': 0,
            'left': 0,
            'pointer-events': 'none',
            'position': 'absolute',
            'right': 0,
            'top': 0
        });

        return this;
    },

    /**
     * Attach events, effectively allowing cues to update with video.
     * @return {Renderer} The current instance for method chaining.
     */
    attach: function () {
        this.player.addEvent('timeupdate', this.processTracks);

        return this;
    },

    /**
     * Detach events, preventing any cues from showing or updating with the video.
     * @return {Renderer} The current instance for method chaining.
     */
    detach: function () {
        this.player.removeEvent('timeupdate', this.processTracks);

        return this;
    },

    /**
     * Show cue display area and track video events.
     * @return {Renderer} The current instance for method chaining.
     */
    enable: function () {
        this.disabled = false;
        this.element.setStyle('display', 'block');
        this.attach();

        return this;
    },

    /**
     * Hide cue display area and no longer track video events.
     * @return {Renderer} The current instance for method chaining.
     */
    disable: function () {
        this.disabled = true;
        this.element.setStyle('display', 'none');
        this.detach();

        return this;
    },

    /**
     * Process text tracks to find active cues and either
     * display them or fire the appropriate events on the
     * `TextTrack` objects themselves.
     */
    processTracks: function () {
        const currentCues = [];
        const time = this.player.video.currentTime + this.options.processingDelay;
        const textTracks = this.player.textTracks;

        /* eslint-disable max-depth */

        // Plain loops are being used here to keeps things as fast as possible.
        for (let t = 0, l = textTracks.length; t < l; t++) {
            const cues = textTracks[t].cues;
            const activeCues = textTracks[t].activeCues;
            let i = 0;

            // cueexit
            i = activeCues.length;
            while (i--) {
                if (activeCues[i].startTime > time || activeCues[i].endTime < time) {
                    if (activeCues[i].pauseOnExit) {
                        this.player.pause();
                    }

                    activeCues.splice(i, 1);
                    currentCues.splice(i, 1);
                }
            }

            // cueenter
            i = cues.length;
            while (i--) {
                if (cues[i].startTime <= time && cues[i].endTime >= time) {
                    activeCues.include(cues[i]);
                    currentCues.include(cues[i]);
                }
            }
        }

        /* eslint-enable max-depth */

        // Finally, render cues into DOM
        WebVTT.processCues(window, currentCues, this.element);
    },

    /**
     * Convert the class to an element for use in DOM operations.
     * @return {Element} The element the cues will be injected into.
     */
    toElement: function () {
        return this.element;
    }
});

export default Renderer;
