/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import 'fullscreen-api-polyfill';
import MediaEvents from './core/MediaEvents.js';   // eslint-disable-line
import Loader from './track/Loader.js';
import TextTrack from './track/TextTrack.js';
import Renderer from './track/Renderer.js';
import Debugger from './Debugger.js';
import Title from './Title.js';
import Playlist from './Playlist.js';
import Slider from './component/Slider.js';
import Tooltip from './component/Tooltip.js';
import Checkbox from './component/Checkbox.js';
import { basename, formatSeconds, getAttributes } from './Utility.js';

const HAS_TRACK_SUPPORT = 'track' in document.createElement('track');

/**
 * Creates new instances of the Moovie player.
 * @type {Class}
 */
const Moovie = new Class({
    Implements: [Options],

    options: {
        debugger: {},
        title: {},
        playlist: [],
        controls: {
            autohide: true,
            tooltips: true
        },
        plugins: []
    },

    textTracks: [],

    initialize: function (video, options) {
        this.setVideo(video);
        this.setOptions(options);

        this.build();
        this.attach();

        if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
            if (this.video.buffered.length) {
                const buffered = this.video.buffered.end(this.video.buffered.length - 1);
                const percent = buffered / this.video.duration * 100;

                this.controls.seekbar.buffered.setStyle('width', `${percent}%`);
            }

            if (!this.video.autoplay) {
                this.element.set('data-playbackstate', 'stopped');
            }
        }

        this.options.plugins.forEach((pluginName) => {
            if (typeOf(Moovie.plugins[pluginName]) === 'function') {
                Moovie.plugins[pluginName].call(this, this.options[pluginName] || {});
            }
        });
    },

    setVideo: function (video) {
        this.video = document.id(video);

        if (HAS_TRACK_SUPPORT) {
            // disable native text tracks
            for (let i = 0, l = this.video.textTracks; i < l; i++) {
                this.video.textTracks[i].mode = 'disabled';
            }
        }
    },

    loadTextTrack: function (options) {
        const track = this.addTextTrack(options.kind, options.label, options.language || options.srclang);
        const loader = new Loader(options.src, options.srclang, track.addCue);  // eslint-disable-line

        track.mode = options.default ? 'showing' : 'hidden';
    },

    addTextTrack: function (kind, label, language) {
        const track = new TextTrack(kind, label, language, this.video);

        this.textTracks.push(track);

        return track;
    },

    build: function () {
        this.element = new Element('figure.moovie');
        this.element.wraps(this.video);

        this.buildPlaylist();

        const current = this.playlist.current();

        this.renderer = new Renderer(window, this);
        this.overlay = new Element('div.overlay');
        this.title = new Title(this.options.title);
        this.title.update(current.title || basename(current.src));
        this.debugger = new Debugger(this.video, this.options.debugger);

        this.buildPanels();
        this.buildControls();

        this.element.adopt(this.renderer, this.overlay, this.title, this.panels, this.controls, this.debugger);

        // Adjust text-track renderer height to account for controls
        $(this.renderer).setStyle('bottom', this.controls.getSize().y);
    },

    toElement: function () {
        return this.element;
    },

    attach: function () {
        // The media API only defines one volume-related event, "volumechange". This
        // is fired whenever the .volume or .muted property changes. Currently, the
        // API offers no way of discerning between the two, so we manually keep track
        // instead. This gives a smarter way of controlling the volume, where changing
        // the volume can effect the muted state, and vice versa.
        let muted = this.video.muted;

        this.playlist.addEvent('show', () => {
            this.panels.update('none');
            this.panels.set('aria-hidden', false);
        });

        this.playlist.addEvent('hide', () => {
            this.panels.update('none');
            this.panels.set('aria-hidden', true);
        });

        this.playlist.addEvent('select', (current) => {
            this.textTracks.each(function (track) {
                // disables event listeners
                track.mode = 'disabled';
            }).empty();

            this.panels.info.getElement('dt.title + dd').set('html', current.title || basename(current.src));
            this.panels.info.getElement('dt.url + dd').set('html', current.src);
            this.title.update(current.title || basename(current.src));
            this.title.show();

            Array.convert(current.tracks).forEach((trackObj) => {
                this.loadTextTrack(trackObj);
            });

            this.video.poster = current.poster;
            this.video.src = current.src;
            this.video.load();
            this.video.play();
        });

        this.element.addEvent('mouseenter', () => {
            this.controls.show();
        });

        this.element.addEvent('mouseleave', () => {
            if (this.options.controls.autohide) {
                this.controls.hide();
            }
        });

        this.overlay.addEvent('click', () => {
            this.video.play();
            this.title.show();
        });

        this.video.addEvents({
            click: () => {
                this.video.pause();
            },

            playing: () => {
                this.element.set('data-playbackstate', 'playing');
            },

            pause: () => {
                this.element.set('data-playbackstate', 'paused');
            },

            ended: () => {
                this.element.set('data-playbackstate', 'ended');
                this.playlist.next();
            },

            progress: () => {
                let percent = 0;

                if (this.video.buffered.length) {
                    const buffered = this.video.buffered.end(this.video.buffered.length - 1);

                    percent = buffered / this.video.duration * 100;
                }

                this.controls.seekbar.buffered.setStyle('width', `${percent}%`);
                this.panels.info.getElement('dt.size + dd').set('html', '0 MB');
            },

            seeking: () => {
                this.element.set('data-playbackstate', 'seeking');
            },

            seeked: () => {
                // @bug pressing stop button still shows "seeking" state. This get around that.
                if (this.video.paused) {
                    this.element.set('data-playbackstate', 'paused');
                }
            },

            timeupdate: () => {
                this.controls.seekbar.slider.update(this.video.currentTime);
                this.controls.elapsed.set('text', formatSeconds(this.video.currentTime));
            },

            durationchange: () => {
                this.controls.seekbar.slider.options.max = this.video.duration;
                this.controls.duration.set('text', formatSeconds(this.video.duration));
            },

            volumechange: () => {
                const video = this.video;
                const mutedChanged = muted !== video.muted;

                muted = video.muted;

                // If the volume is at 0 and we try to unmute we need to provide a
                // default volume. 50% seems like a good number...
                if (mutedChanged && !video.muted && video.volume === 0) {
                    video.volume = 0.5;

                // Volume was changed while in the "muted" state, so un-mute as well.
                } else if (video.muted && video.volume !== 0 && !mutedChanged) {
                    video.muted = false;

                // Volume was set to 0 (E.g. dragging slider all the way down), so lets mute.
                } else if (!mutedChanged && !video.muted && video.volume === 0) {
                    video.muted = true;
                }

                this.controls.volume.set('data-muted', video.muted);
                this.controls.volume.set('data-level', video.volume.round(2));

                // If muted, assume 0 for volume to visualize the muted state in
                // the slider as well. Don't actually change the volume, though,
                // so when un-muted, the slider simply goes back to its former value.
                this.controls.volume.slider.update(video.muted && mutedChanged ? 0 : video.volume);
            },

            loadedmetadata: () => {
                this.element.set('data-playbackstate', 'stopped');
            }
        });
    },

    buildPlaylist: function () {
        const tracks = this.video.getChildren('track');

        // destroy old track elements and load our new text tracks
        const serializedTracks = tracks.map((trackElement) => {
            const trackObject = getAttributes(trackElement);

            this.loadTextTrack(trackObject);
            trackElement.removeAttribute('default'); // just to be safe
            trackElement.destroy();

            return trackObject;
        });

        // Create a playlist item from the <video> element
        const item = Object.merge(getAttributes(this.video), {
            tracks: serializedTracks
        });

        const items = [].concat(item, Array.convert(this.options.playlist));

        this.playlist = new Playlist(items);
    },

    buildPanels: function () {
        this.panels = new Element('div.panels');
        this.panels.info = new Element('div.info', {
            html: `<div class="heading">Video information</div>
            <dl>
                <dt class="title">Title</dt>
                <dd>${this.playlist.current().title}</dd>
                <dt class="url">URL</dt>
                <dd>${this.video.src}</dd>
                <dt class="size">Size</dt>
                <dd></dd>
            </dl>`
        });

        this.panels.about = new Element('div.about', {
            html: `<div class="heading">About this player</div>
            <p><strong>Moovie</strong> v0.4.3-<em>alpha</em></p>
            <p>Copyright &copy; 2010, Colin Aarts</p>
            <p><a href="http://colinaarts.com/code/moovie/" rel="external">http://colinaarts.com/code/moovie/</a></p>`
        });

        this.panels.update = function (which) {
            if (which === 'none' || this[which].hasClass('active')) {
                this.getChildren('.active').removeClass('active');
                this.set('aria-hidden', true);
            } else {
                this.getChildren().removeClass('active');
                this[which].addClass('active');
                this.set('aria-hidden', false);
            }
        };

        this.panels.adopt(this.panels.info, this.panels.about, this.playlist);
        this.panels.set('aria-hidden', true);
    },

    buildControls: function () {
        this.controls = new Element('div.controls');
        this.controls.tooltip = new Tooltip(this.controls);

        this.controls.play = new Element('div.play[aria-label=Play Video]');
        this.controls.play.addEvent('click', () => {
            if (this.video.paused && this.video.readyState >= 3) {
                this.video.play();
            } else if (!this.video.paused && this.video.ended) {
                this.video.currentTime = 0;
            } else if (!this.video.paused) {
                this.video.pause();
            }
        });

        this.controls.stop = new Element('div.stop[aria-label=Stop Video]');
        this.controls.stop.addEvent('click', () => {
            this.video.currentTime = 0;
            this.video.pause();
        });

        this.controls.previous = new Element('div.previous[aria-label=Previous Video]');
        this.controls.previous.addEvent('click', () => {
            this.playlist.previous();
        });

        this.controls.next = new Element('div.next[aria-label=Next Video]');
        this.controls.next.addEvent('click', () => {
            this.playlist.next();
        });

        this.controls.elapsed = new Element('div.elapsed[text=0:00]');
        this.controls.seekbar = this.createSeekbar();
        this.controls.duration = new Element('div.duration[text=0:00]');
        this.controls.volume = this.createVolumeControl();
        this.controls.settings = this.createSettingsControl();
        this.controls.more = this.createMoreControl();
        this.controls.fullscreen = new Element('div.fullscreen[aria-label=Enter Fullscreen]');
        this.controls.fullscreen.addEvent('click', () => {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                this.element.requestFullscreen();
            }
        });

        this.controls.adopt(
            this.controls.play,
            this.controls.stop,
            this.controls.previous,
            this.controls.next,
            this.controls.elapsed,
            this.controls.seekbar,
            this.controls.duration,
            this.controls.volume,
            this.controls.settings,
            this.controls.more,
            this.controls.fullscreen,
            this.controls.tooltip
        );

        this.video.controls = false; // disable native controls

        this.controls.show = function () {
            return this.set('aria-hidden', false);
        };

        this.controls.hide = function () {
            return this.set('aria-hidden', true);
        };

        this.controls.elapsed.set('text', formatSeconds(this.video.currentTime || 0));
        this.controls.duration.set('text', formatSeconds(this.video.duration || 0));
    },

    createSeekbar: function () {
        const video = this.video;
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
        seekbar.tooltip.detach();   // we don't want to use the disable() method here

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
        const video = this.video;
        const volume = new Element('div.volume[aria-label=Mute Audio]');

        volume.addEvent('click', function () {
            video.muted = !video.muted;
        });

        volume.popup = new Element('div.popup');
        volume.popup.addEvent('click', function () {
            // stop child elements from triggering the mute when clicked
            return false;
        });

        volume.slider = new Slider({
            min: 0,
            max: 1,
            value: video.volume,
            orientation: 'vertical',
            onMove: function (val) {
                video.volume = val;
            }
        });

        volume.popup.grab(volume.slider);
        volume.grab(volume.popup);

        return volume;
    },

    createSettingsControl: function () {
        const self = this;
        const settings = new Element('div.settings[aria-label="View Settings"]');

        settings.popup = new Element('div.popup');
        settings.toggleControls = new Checkbox('autohide', {
            label: 'Autohide Controls',
            checked: this.options.controls.autohide,
            onChange: function () {
                self.options.controls.autohide = this.checked;
            }
        });

        settings.loopVideo = new Checkbox('loop', {
            label: 'Loop video',
            checked: this.video.loop,
            onChange: function () {
                self.video.loop = this.checked;
                self.panels.update('none');
            }
        });

        settings.renderTextTracks = new Checkbox('renderer', {
            label: 'Render text-tracks',
            checked: !this.renderer.disabled,
            onChange: function () {
                self.renderer[this.checked ? 'enable' : 'disable']();
                self.panels.update('none');
            }
        });

        settings.enableDebugger = new Checkbox('debugger', {
            label: 'Enable Debugger',
            checked: !this.debugger.disabled,
            onChange: function () {
                self.debugger[this.checked ? 'enable' : 'disable']();
                self.panels.update('none');
            }
        });

        settings.popup.adopt(
            settings.toggleControls,
            settings.loopVideo,
            settings.renderTextTracks,
            settings.enableDebugger
        );

        settings.grab(settings.popup);

        return settings;
    },

    createMoreControl: function () {
        const playlist = this.playlist;
        const panels = this.panels;
        const more = new Element('div.more[aria-label="Show More Popup"]');

        more.popup = new Element('div.popup');
        more.about = new Element('div.about[aria-label=About Moovie]');
        more.about.addEvent('click', function () {
            panels.update('about');
        });

        more.info = new Element('div.info[aria-label=View Video Info]');
        more.info.addEvent('click', function () {
            panels.update('info');
        });

        more.playlist = new Element('div.playlist[aria-label=Open Playlist]');
        more.playlist.addEvent('click', function () {
            if (playlist.hidden) {
                playlist.show();
            } else {
                playlist.hide();
            }
        });

        more.popup.adopt(more.about, more.info, more.playlist);
        more.grab(more.popup);

        return more;
    }
});

Moovie.plugins = {};

Moovie.registerPlugin = function (name, plugin) {
    if (!Moovie.plugins[name]) {
        Moovie.plugins[name] = plugin;
    }
};

Element.implement({
    // method to polyfill <video> tags
    toMoovie: function (options) {
        this.store('moovie', new Moovie(this, options));
    }
});

export { Moovie as default };
