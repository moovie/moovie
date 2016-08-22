/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import MediaEvents from './core/media-events.js';   // eslint-disable-line
import screenfull from 'screenfull';
import Loader from './track/loader.js';
import TextTrack from './track/text-track.js';
import Renderer from './track/renderer.js';
import Debugger from './Debugger.js';
import Title from './Title.js';
import Playlist from './Playlist.js';
import formatSeconds from './utils/formatSeconds.js';
import basename from './utils/basename.js';
import getAttributes from './utils/get-attributes.js';

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

        if (!this.video.autoplay) {
            this.container.set('data-playbackstate', 'stopped');
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

        // Get knob offsets for later and adjust renderer height to account for controls
        this.controls.seekbar.knob.left = this.controls.seekbar.knob.getStyle('left').toInt();
        this.controls.volume.knob.top = this.controls.volume.knob.getStyle('top').toInt();
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
                this.controls.show();
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
                const percent = this.video.currentTime / this.video.duration * 100;
                const offset = this.controls.seekbar.track.getSize().x / 100 * percent;
                const position = offset + this.controls.seekbar.knob.left;

                this.controls.elapsed.set('text', formatSeconds(this.video.currentTime));
                this.controls.seekbar.played.setStyle('width', `${percent}%`);
                this.controls.seekbar.knob.setStyle('left', `${position}px`);
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

                // If muted, assume 0 for volume to visualize the
                // muted state in the slider as well. Don't actually
                // change the volume, though, so when un-muted, the
                // slider simply goes back to its former value.
                const volume = video.muted && mutedChanged ? 0 : video.volume;
                const barSize = this.controls.volume.track.getSize().y;
                const offset = barSize - volume * barSize;

                this.controls.volume.knob.setStyle('top', offset + this.controls.volume.knob.top);
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
        const self = this;
        const autohideControls = this.options.controls.autohide;

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

        this.panels.settings = new Element('div.settings', {
            html: `<div class="heading">Settings</div>
            <div class="checkbox-widget" data-control="autohide" data-checked="${autohideControls}">
                <div class="checkbox"></div>
                <div class="label">Auto-hide controls</div>
            </div>
            <div class="checkbox-widget" data-control="loop" data-checked="${this.video.loop}">
                <div class="checkbox"></div>
                <div class="label">Loop video</div>
            </div>
            <div class="checkbox-widget" data-control="renderer" data-checked="${!this.renderer.disabled}">
                <div class="checkbox"></div>
                <div class="label">Render text-tracks</div>
            </div>
            <div class="checkbox-widget" data-control="debugger" data-checked="${!this.debugger.disabled}">
                <div class="checkbox"></div>
                <div class="label">Enable Debugger</div>
            </div>`
        });

        this.panels.settings.addEvent('click:relay(.checkbox-widget)', function () {
            if (this.get('data-checked') === 'false') {
                this.set('data-checked', 'true');
            } else {
                this.set('data-checked', 'false');
            }

            const control = this.get('data-control');
            const checked = this.get('data-checked');

            switch (control) {
                case 'autohide':
                    self.options.controls.autohide = checked === 'true';
                    break;

                case 'loop':
                    self.video.loop = checked === 'true';
                    break;

                case 'renderer':
                    self.renderer[checked === 'false' ? 'disable' : 'enable']();
                    break;

                case 'debugger':
                    self.debugger[checked === 'false' ? 'disable' : 'enable']();
                    break;

                // no default
            }

            self.panels.update('none');
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

        this.panels.adopt(this.panels.info, this.panels.settings, this.panels.about, this.playlist);
        this.panels.set('aria-hidden', true);
    },

    buildControls: function () {
        this.controls = new Element('div.controls');
        this.controls.tooltip = new Element('div.moovie-tooltip');

        this.controls.play = new Element('div.play[data-title=Play]');
        this.controls.play.addEvent('click', () => {
            if (this.video.paused && this.video.readyState >= 3) {
                this.video.play();
            } else if (!this.video.paused && this.video.ended) {
                this.video.currentTime = 0;
            } else if (!this.video.paused) {
                this.video.pause();
            }
        });

        this.controls.stop = new Element('div.stop[data-title=Stop]');
        this.controls.stop.addEvent('click', () => {
            this.video.currentTime = 0;
            this.video.pause();
        });

        this.controls.previous = new Element('div.previous[data-title=Previous]');
        this.controls.previous.addEvent('click', () => {
            this.playlist.previous();
        });

        this.controls.next = new Element('div.next[data-title=Next]');
        this.controls.next.addEvent('click', () => {
            this.playlist.next();
        });

        this.controls.elapsed = new Element('div.elapsed[text=0:00]');
        this.controls.seekbar = this.createSeekbar();
        this.controls.duration = new Element('div.duration[text=0:00]');
        this.controls.volume = this.createVolumeControl();
        this.controls.settings = new Element('div.settings[data-title=Settings]');
        this.controls.settings.addEvent('click', () => {
            this.panels.update('settings');
        });

        this.controls.more = this.createMoreControl();
        this.controls.fullscreen = new Element('div.fullscreen[data-title=Fullscreen]');
        this.controls.fullscreen.addEvent('click', () => {
            screenfull.toggle(this.wrapper);
        });

        this.controls.tooltip.inject(document.body);
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
            this.controls.fullscreen
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

        this.controls.addEvents({
            mousemove: function (e) {
                const title = e.target.get('data-title');

                if (e.target !== this && title) {
                    this.tooltip.set('text', title)
                        .set('aria-hidden', false)
                        .setStyles({
                            left: e.page.x + 16,
                            top: e.page.y + 16
                        });
                } else {
                    this.tooltip.set('aria-hidden', true);
                }
            },

            mouseleave: function () {
                this.tooltip.set('aria-hidden', true);
            }
        });
    },

    createSeekbar: function () {
        const video = this.video;
        const seekbar = new Element('div.seekbar');

        const locToTime = function (value) {
            const position = seekbar.track.getPosition().x;
            const width = seekbar.track.getSize().x;
            const offsetPx = value - position;
            const offsetPc = offsetPx / width * 100;

            return video.duration / 100 * offsetPc;
        };

        seekbar.addEvent('mousedown', function (e) {
            const update = function (e) {
                const offset = e.page.x - seekbar.track.getPosition().x;
                const pct = offset / seekbar.track.getSize().x;

                video.pause();
                video.currentTime = (pct * video.duration).limit(0, video.duration);
            };

            const move = function (e) {
                update(e);
            };

            const stop = function () {
                document.removeEvent('mousemove', move);
                document.removeEvent('mouseup', stop);
                video.play();
            };

            document.addEvent('mousemove', move);
            document.addEvent('mouseup', stop);

            update(e);
        });

        seekbar.slider = new Element('div.slider');
        seekbar.slider.addEvents({
            mousemove: function (e) {
                const barX = seekbar.track.getPosition().x;
                const sliderX = seekbar.knob.getPosition().x;
                let position = 0;
                let time = 0;

                // provides the "snap" like effect when the mouse is over the slider's knob
                if (e.target === seekbar.knob) {
                    position = sliderX - barX - seekbar.knob.left;
                    time = formatSeconds(locToTime(sliderX - seekbar.knob.left));
                } else {
                    position = e.page.x - barX;
                    time = formatSeconds(locToTime(e.page.x));
                }

                seekbar.time.set('data-displaystate', 'showing');
                seekbar.time.setStyle('left', `${position}px`);
                seekbar.time.getFirst().set('text', time);
            },

            mouseleave: function () {
                seekbar.time.set('data-displaystate', 'hidden');
            }
        });

        seekbar.track = new Element('div.track');
        seekbar.time = new Element('div.tooltip').grab(new Element('div[text=0:00]'));
        seekbar.buffered = new Element('div.buffered');
        seekbar.played = new Element('div.played');
        seekbar.knob = new Element('div.knob');

        seekbar.track.adopt(seekbar.buffered, seekbar.played, seekbar.knob);
        seekbar.slider.adopt(seekbar.track);
        seekbar.adopt(seekbar.time, seekbar.slider);
        seekbar.time.set('data-displaystate', 'hidden');

        return seekbar;
    },

    createVolumeControl: function () {
        const video = this.video;
        const volume = new Element('div.volume[data-title=Mute]');

        volume.addEvent('click', function () {
            video.muted = !video.muted;
        });

        volume.popup = new Element('div.popup');
        volume.popup.addEvent('click', function () {
            // stop child elements from triggering the mute when clicked
            return false;
        });

        volume.slider = new Element('div.slider');
        volume.slider.addEvent('mousedown', function (e) {
            const update = function (e) {
                const offset = e.page.y - volume.track.getPosition().y;
                const pct = offset / volume.track.getSize().y;

                video.volume = (1 - pct * 1).limit(0, 1);
            };

            const move = function (e) {
                update(e);
            };

            const stop = function () {
                document.removeEvent('mousemove', move);
                document.removeEvent('mouseup', stop);
            };

            document.addEvent('mousemove', move);
            document.addEvent('mouseup', stop);

            update(e);
        });

        volume.track = new Element('div.track');
        volume.knob = new Element('div.knob');

        volume.track.grab(volume.knob);
        volume.slider.grab(volume.track);
        volume.popup.grab(volume.slider);
        volume.grab(volume.popup);

        return volume;
    },

    createMoreControl: function () {
        const playlist = this.playlist;
        const panels = this.panels;
        const more = new Element('div.more[data-title="More"]');

        more.popup = new Element('div.popup');
        more.about = new Element('div.about[data-title=About]');
        more.about.addEvent('click', function () {
            panels.update('about');
        });

        more.info = new Element('div.info[data-title=Video info]');
        more.info.addEvent('click', function () {
            panels.update('info');
        });

        more.playlist = new Element('div.playlist[data-title=Playlist]');
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
