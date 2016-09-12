import { formatSeconds } from './Utility.js';
import Slider from './component/Slider.js';
import Tooltip from './component/Tooltip.js';

const ControlBar = new Class({
    Implements: [Events, Options],

    /**
     * options.onShow = function () {}
     * options.onHide = function () {}
     */
    options: {
        autohide: true,
        tooltips: true
    },

    initialize: function (player, options) {
        this.player = player;
        this.setOptions(options);
        this.build();
        this.bindListeners().attach();
    },

    build: function () {
        this.element = new Element('div.moovie-controls');
        this.play = this.createPlayControl();
        this.stop = this.createStopControl();
        this.previous = this.createPreviousControl();
        this.next = this.createNextControl();
        this.elapsed = new Element('div.elapsed[text=0:00]');
        this.seekbar = this.createSeekbar();
        this.duration = new Element('div.duration[text=0:00]');
        this.volume = this.createVolumeControl();
        this.settings = this.createSettingsControl();
        this.more = this.createMoreControl();
        this.fullscreen = this.createFullscreenControl();
        this.tooltip = new Tooltip(this.element);

        this.element.adopt(
            this.play,
            this.stop,
            this.previous,
            this.next,
            this.elapsed,
            this.seekbar,
            this.duration,
            this.volume,
            this.settings,
            this.more,
            this.fullscreen,
            this.tooltip
        );

        // disable native controls
        this.player.video.controls = false;
    },

    bindListeners: function () {
        this.show = this.show.bind(this);
        this.autohide = this.autohide.bind(this);

        return this;
    },

    attach: function () {
        $(this.player).addEvent('mouseenter', this.show);
        $(this.player).addEvent('mouseleave', this.autohide);

        return this;
    },

    detach: function () {
        $(this.player).removeEvent('mouseenter', this.show);
        $(this.player).removeEvent('mouseleave', this.autohide);

        return this;
    },

    show: function () {
        this.hidden = false;
        this.element.removeAttribute('hidden');
        this.fireEvent('show');

        return this;
    },

    hide: function () {
        this.hidden = true;
        this.element.set('hidden', '');
        this.fireEvent('false');

        return this;
    },

    autohide: function () {
        if (this.options.autohide) {
            this.hide();
        }
    },

    toElement: function () {
        return this.element;
    },

    createPlayControl: function () {
        const video = this.player.video;
        const play = new Element('button.play[aria-label=Play Video]');

        play.addEvent('click', function () {
            if (video.paused && video.readyState >= 3) {
                video.play();
            } else if (!video.paused && video.ended) {
                video.currentTime = 0;
            } else if (!video.paused) {
                video.pause();
            }
        });

        return play;
    },

    createStopControl: function () {
        const stop = new Element('button.stop[aria-label=Stop Video]');

        stop.addEvent('click', () => {
            this.player.stop();
        });

        return stop;
    },

    createPreviousControl: function () {
        const previous = new Element('button.previous[aria-label=Previous Video]');

        previous.set('disabled', !this.player.playlist.hasPrevious());
        previous.addEvent('click', () => {
            this.player.playlist.previous();
        });

        return previous;
    },

    createNextControl: function () {
        const next = new Element('button.next[aria-label=Next Video]');

        next.set('disabled', !this.player.playlist.hasNext());
        next.addEvent('click', () => {
            this.player.playlist.next();
        });

        return next;
    },

    createSeekbar: function () {
        const video = this.player.video;
        const seekbar = new Element('div.seekbar');
        let wasPlaying = !(video.paused || video.ended);

        seekbar.slider = new Slider({
            min: 0,
            max: video.duration,
            value: video.currentTime,
            onStart: function (val) {
                wasPlaying = !(video.paused || video.ended);
                video.pause();
                video.currentTime = val === video.duration ? val - 1 : val;
            },
            onMove: function (val) {
                video.currentTime = val === video.duration ? val - 1 : val;
            },
            onStop: function () {
                // resume playing only if video was playing before we started seeking
                if (wasPlaying) {
                    video.play();
                }
            }
        });

        seekbar.tooltip = new Tooltip(seekbar.slider);
        seekbar.tooltip.detach();

        $(seekbar.slider).addEvents({
            mousemove: function (event) {
                const position = event.page.x - seekbar.slider.track.getLeft();
                const limit = seekbar.slider.track.getSize().x;
                const time = formatSeconds(position / limit * video.duration);

                if (event.target !== seekbar.slider.thumb) {
                    $(seekbar.tooltip).set('text', time);
                    $(seekbar.tooltip).setStyle('left', position);
                    seekbar.tooltip.show();
                }
            },

            mouseleave: function () {
                seekbar.tooltip.hide();
            }
        });

        $(seekbar.slider.thumb).addEvents({
            mouseenter: function () {
                const position = seekbar.slider.fill.getSize().x;
                const limit = seekbar.slider.track.getSize().x;
                const time = position / limit * video.duration;

                $(seekbar.tooltip).set('text', formatSeconds(time));
                $(seekbar.tooltip).setStyle('left', position);
                seekbar.tooltip.show();
            },

            mouseleave: function () {
                seekbar.tooltip.hide();
            }
        });

        seekbar.buffered = new Element('div.seekbar-buffered');
        seekbar.buffered.inject(seekbar.slider.track, 'after');
        seekbar.adopt(seekbar.slider, seekbar.tooltip);

        return seekbar;
    },

    createVolumeControl: function () {
        const volume = new Element('div.moovie-popup.volume-control');
        const button = new Element('button.popup-target[aria-label=Mute Audio]');
        const content = new Element('div.popup-content');

        button.addEvent('click', () => {
            this.player.video.muted = !this.player.video.muted;
        });

        volume.slider = new Slider({
            min: 0,
            max: 1,
            value: this.player.video.volume,
            orientation: 'vertical',
            onMove: (val) => {
                this.player.video.volume = val;
            }
        });

        content.grab(volume.slider);
        volume.adopt(button, content);

        return volume;
    },

    createSettingsControl: function () {
        const settings = new Element('div.moovie-popup.settings-control');
        const button = new Element('button.popup-target[aria-label=View Settings]');
        const content = new Element('div.popup-content');
        const autohideControls = this.options.autohide ? '[checked]' : '';
        const loopVideo = this.player.loop ? '[checked]' : '';
        const renderTracks = this.player.renderer.disabled ? '' : '[checked]';
        const showDebugger = this.player.debugger.disabled ? '' : '[checked]';

        settings.addEvent('click:relay(.moovie-checkbox)', (event) => {
            switch (event.target.id) {
                case 'autohide-controls':
                    this.options.autohide = event.target.checked;
                    return; // eslint-disable-line newline-before-return

                case 'loop-video':
                    this.player.loop = event.target.checked;
                    return; // eslint-disable-line newline-before-return

                case 'render-tracks':
                    this.player.renderer[event.target.checked ? 'enable' : 'disable']();
                    return; // eslint-disable-line newline-before-return

                case 'show-debugger':
                    this.player.debugger[event.target.checked ? 'enable' : 'disable']();
                    return; // eslint-disable-line newline-before-return

                // no default
            }
        });

        content.adopt(
            new Element(`input[type=checkbox].moovie-checkbox#autohide-controls${autohideControls}`),
            new Element('label.moovie-label[for="autohide-controls"][text=Autohide Controls]'),
            new Element(`input[type=checkbox].moovie-checkbox#loop-video${loopVideo}`),
            new Element('label.moovie-label[for="loop-video"][text=Loop Video]'),
            new Element(`input[type=checkbox].moovie-checkbox#render-tracks${renderTracks}`),
            new Element('label.moovie-label[for="render-tracks"][text=Render Text Tracks]'),
            new Element(`input[type=checkbox].moovie-checkbox#show-debugger${showDebugger}`),
            new Element('label.moovie-label[for="show-debugger"][text=Show Debugger]')
        );

        settings.adopt(button, content);

        return settings;
    },

    createMoreControl: function () {
        const more = new Element('div.moovie-popup.more-control');
        const button = new Element('button.popup-target[aria-label=Show More Popup]');
        const content = new Element('div.popup-content');

        more.about = new Element('button.about[aria-label=About Moovie]');
        more.about.addEvent('click', () => {
            this.player.playlist.hide();
            this.player.aboutPanel.removeAttribute('hidden');
        });

        more.playlist = new Element('button.playlist[aria-label=Show Playlist]');
        more.playlist.addEvent('click', () => {
            this.player.playlist.show();
        });

        content.adopt(more.about, more.playlist);
        more.adopt(button, content);

        return more;
    },

    createFullscreenControl: function () {
        const fullscreen = new Element('button.fullscreen[aria-label=Enter Fullscreen]');

        fullscreen.addEvent('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                $(this.player).requestFullscreen();
            }
        });

        return fullscreen;
    }
});

export default ControlBar;
