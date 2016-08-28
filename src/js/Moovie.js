/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import MediaEvents from './core/MediaEvents.js';   // eslint-disable-line
import screenfull from 'screenfull';
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
        }
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
                this.container.set('data-playbackstate', 'stopped');
            }
        }
    },

    setVideo: function (video) {
        this.video = document.id(video);

        if (HAS_TRACK_SUPPORT) {
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
        this.container = new Element('div.moovie');
        this.wrapper = new Element('div.wrapper');
        this.wrapper.wraps(this.video);
        this.container.wraps(this.wrapper);

        this.buildPlaylist();

        const current = this.playlist.current();

        this.renderer = new Renderer(window, this);
        this.overlay = new Element('div.overlay');
        this.title = new Title(this.options.title);
        this.title.update(current.title || basename(current.src));
        this.debugger = new Debugger(this.video, this.options.debugger);

        this.buildPanels();
        this.buildControls();

        // Inject and do some post-processing --------------------------------------
        this.wrapper.adopt(this.renderer, this.overlay, this.title, this.panels, this.controls, this.debugger);

        // Adjust text-track renderer height to account for controls
        $(this.renderer).setStyle('bottom', this.controls.getSize().y);
    },

    attach: function () {
        // Unfortunately, the media API only defines one volume-related
        // event: `volumechange`. This event is fired whenever the media's
        // `volume` attribute changes, or the media's `muted` attribute
        // changes. The API defines no way to discern the two, so we'll
        // have to "manually" keep track. We need to do this in order to
        // be able to provide the advanced volume control (a la YouTube's
        // player): changing the volume can have an effect on the muted
        // state and vice versa.
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
                track.mode = 'disabled';    // disables any event listeners
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

        this.wrapper.addEvent('mouseenter', () => {
            this.controls.show();
        });

        this.wrapper.addEvent('mouseleave', () => {
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
                this.container.set('data-playbackstate', 'playing');
            },

            pause: () => {
                this.container.set('data-playbackstate', 'paused');
            },

            ended: () => {
                this.container.set('data-playbackstate', 'ended');
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
                this.container.set('data-playbackstate', 'seeking');
            },

            seeked: () => {
                // @bug pressing stop button still shows "seeking" state. This get around that.
                if (this.video.paused) {
                    this.container.set('data-playbackstate', 'paused');
                }
            },

            timeupdate: () => {
                this.controls.seekbar.slider.update(this.video.currentTime);
                this.controls.elapsed.set('text', formatSeconds(this.video.currentTime));
            },

            durationchange: () => {
                this.controls.duration.set('text', formatSeconds(this.video.duration));
            },

            volumechange: () => {
                const video = this.video;
                const mutedChanged = muted !== video.muted;

                muted = video.muted;

                // Un-muted with volume at 0 -- pick a sane default. This
                // is probably the only deviation from the way the YouTube
                // flash player handles volume control.
                if (mutedChanged && !video.muted && video.volume === 0) {
                    video.volume = 0.5;

                // Volume changed while muted -> un-mute
                } else if (video.muted && video.volume !== 0 && !mutedChanged) {
                    video.muted = false;

                // Slider dragged to 0 -> mute
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
                this.container.set('data-playbackstate', 'stopped'); // or 'ready', or 'idle'
            }
        });
    },

    buildPlaylist: function () {
        const video = this.video;
        const tracks = video.getChildren('track');
        const items = [];
        const serializedTracks = tracks.map(function (track) {
            track.removeAttribute('default'); // just to be safe
            return getAttributes(track);
        });

        if (typeOf(this.options.playlist) === 'array') {
            items.combine(Array.convert(this.options.playlist));

            // Add the current video to the playlist stack
            items.unshift({
                id: video.get('id'),
                title: video.get('title') || basename(video.currentSrc || video.src),
                src: video.currentSrc || video.src,
                tracks: serializedTracks
            });
        }

        serializedTracks.forEach((serializedTrack) => {
            this.loadTextTrack(serializedTrack);
        });

        tracks.destroy();

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
            screenfull.toggle(this.wrapper);
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

Element.implement({
    // method to polyfill <video> tags
    toMoovie: function (options) {
        this.store('moovie', new Moovie(this, options));
    }
});

export { Moovie as default };
