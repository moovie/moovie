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
import { formatSeconds, getAttributes } from './Utility.js';

const HAS_TRACK_SUPPORT = 'track' in document.createElement('track');

/**
 * Creates new instances of the Moovie player.
 * @type {Class}
 */
const Moovie = new Class({
    Implements: [Events, Options],

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
    muted: false,

    initialize: function (video, options) {
        this.setVideo(video);
        this.setOptions(options);

        this.muted = this.video.muted;

        this.build();
        this.bindListeners().attach();

        this.options.plugins.forEach((pluginName) => {
            if (typeOf(Moovie.plugins[pluginName]) === 'function') {
                Moovie.plugins[pluginName].call(this, this.options[pluginName] || {});
            }
        });

        if (this.video.readyState >= this.video.HAVE_NOTHING) {
            this.onLoadStart();
        }

        if (this.video.readyState >= this.video.HAVE_METADATA) {
            this.onDurationChange();
            this.onLoadedMetaData();
        }

        if (this.video.readyState >= this.video.HAVE_CURRENT_DATA) {
            this.onLoadedData();
        }

        if (this.video.readyState >= this.video.HAVE_FUTURE_DATA) {
            this.onCanPlay();
        }

        if (this.video.readyState == this.video.HAVE_ENOUGH_DATA) {
            this.onCanPlayThrough();
        }
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
        this.title.update(current.title);
        this.debugger = new Debugger(this.video, this.options.debugger);

        this.buildPanels();
        this.buildControls();

        this.element.adopt(
            this.renderer,
            this.overlay,
            this.title,
            this.playlist,
            this.videoInfoPanel,
            this.aboutPanel,
            this.controls,
            this.debugger
        );

        // Adjust text-track renderer height to account for controls
        $(this.renderer).setStyle('bottom', this.controls.getSize().y);
    },

    toElement: function () {
        return this.element;
    },

    bindListeners: function () {
        this.onLoadStart = this.onLoadStart.bind(this);
        this.onProgress = this.onProgress.bind(this);
        this.onDurationChange = this.onDurationChange.bind(this);
        this.onLoadedMetaData = this.onLoadedMetaData.bind(this);
        this.onLoadedData = this.onLoadedData.bind(this);
        this.onCanPlay = this.onCanPlay.bind(this);
        this.onCanPlayThrough = this.onCanPlayThrough.bind(this);
        this.onVolumeChange = this.onVolumeChange.bind(this);
        this.onSeeking = this.onSeeking.bind(this);
        this.onSeeked = this.onSeeked.bind(this);
        this.onEnded = this.onEnded.bind(this);
        this.pause = this.pause.bind(this);
        this.onPlaying = this.onPlaying.bind(this);
        this.onPause = this.onPause.bind(this);
        this.onTimeUpdate = this.onTimeUpdate.bind(this);

        return this;
    },

    attach: function () {
        this.playlist.addEvent('show', () => {
            this.videoInfoPanel.set('hidden', '');
            this.aboutPanel.set('hidden', '');
            this.playlist.displayItem(this.playlist.index);
        });

        this.playlist.addEvent('select', (current) => {
            this.playlist.displayItem(this.playlist.index);
            this.textTracks.each(function (track) {
                // disables event listeners
                track.mode = 'disabled';
            }).empty();

            this.playlist.fireEvent('queuechange');
            this.videoInfoPanel.getElement('dt.title + dd').set('html', current.title);
            this.videoInfoPanel.getElement('dt.url + dd').set('html', current.src);
            this.title.update(current.title);
            this.title.show();

            Array.convert(current.tracks).forEach((trackObj) => {
                this.loadTextTrack(trackObj);
            });

            this.video.poster = current.poster;
            this.video.src = current.src;
            this.video.load();
            this.video.play();
        });

        this.playlist.addEvent('queuechange', () => {
            // hide appropriate playlist buttons
            this.controls.previous.set('aria-disabled', !this.playlist.hasPrevious());
            this.controls.next.set('aria-disabled', !this.playlist.hasNext());
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
            volumechange: this.onVolumeChange,
            seeking: this.onSeeking,
            seeked: this.onSeeked,
            click: this.pause,
            playing: this.onPlaying,
            progress: this.onProgress,
            pause: this.onPause,
            ended: this.onEnded,
            loadstart: this.onLoadStart,
            durationchange: this.onDurationChange,
            loadedmetadata: this.onLoadedMetaData,
            loadeddata: this.onLoadedData,
            canplay: this.onCanPlay,
            canplaythrough: this.onCanPlayThrough,
            timeupdate: this.onTimeUpdate
        });
    },

    onVolumeChange: function () {
        // The media API only defines one volume-related event, "volumechange". This
        // is fired whenever the .volume or .muted property changes. Currently, the
        // API offers no way of discerning between the two, so we manually keep track
        // instead. This gives us a smarter way of controlling the volume, where
        // changing the volume can effect the muted state, and vice versa.
        const muteChange = this.muted !== this.video.muted;

        // make sure our mute reference stays in sync
        this.muted = this.video.muted;

        // If the volume is at 0 and we try to unmute we need to provide a
        // default volume. 50% seems like a good number...
        if (muteChange && !this.video.muted && this.video.volume === 0) {
            this.video.volume = 0.5;

        // Volume was changed while in the "muted" state, so un-mute as well.
        } else if (this.video.muted && this.video.volume !== 0 && !muteChange) {
            this.video.muted = false;

        // Volume was set to 0 (E.g. dragging slider all the way down), so lets mute.
        } else if (!muteChange && !this.video.muted && this.video.volume === 0) {
            this.video.muted = true;
        }

        this.controls.volume.set('data-muted', this.video.muted);
        this.controls.volume.set('data-level', this.video.volume.round(2));

        // If muted, assume 0 for volume to visualize the muted state in
        // the slider as well. Don't actually change the volume, though,
        // so when un-muted, the slider simply goes back to its former value.
        this.controls.volume.slider.update(this.video.muted && muteChange ? 0 : this.video.volume);
    },

    setPlaybackState: function (playbackState) {
        this.playbackState = playbackState;
        this.element.set('data-playbackstate', playbackState);

        return this;
    },

    onLoadStart: function () {
        this.setPlaybackState('loading').fireEvent('loadstart');
    },

    onDurationChange: function () {
        this.controls.seekbar.slider.options.max = this.video.duration;
        this.controls.duration.set('text', formatSeconds(this.video.duration));
        this.startProgressTracking();
        this.fireEvent('durationchange');
    },

    onLoadedMetaData: function () {
        this.fireEvent('loadedmetadata');
    },

    onLoadedData: function () {
        this.setPlaybackState('stopped').fireEvent('loadeddata');
    },

    onCanPlay: function () {
        this.fireEvent('canplay');
    },

    onCanPlayThrough: function () {
        this.fireEvent('canplaythrough');
    },

    onTimeUpdate: function () {
        this.controls.seekbar.slider.update(this.video.currentTime);
        this.controls.elapsed.set('text', formatSeconds(this.video.currentTime));
    },

    onSeeking: function () {
        this.setPlaybackState('seeking').fireEvent('seeking');
    },

    onSeeked: function () {
        // The video will still be in the "seeked" state if the
        // video was paused before seeking. This fixes that.
        if (this.video.paused) {
            this.onPause();
        }
    },

    onPlaying: function () {
        this.setPlaybackState('playing').fireEvent('play');
    },

    onPause: function () {
        this.setPlaybackState('paused').fireEvent('pause');
    },

    onEnded: function () {
        this.setPlaybackState('ended').fireEvent('ended');

        if (this.playlist.hasNext()) {
            this.playlist.next();
        }
    },

    play: function () {
        if (this.readyState === this.video.HAVE_FUTURE_DATA) {
            this.video.play();
        }

        return this;
    },

    pause: function () {
        this.video.pause();

        return this;
    },

    startProgressTracking: function () {
        this.stopProgressTracking();    // Remove any previous progress handlers
        this.onProgress.id = setInterval(this.onProgress, 500);
    },

    stopProgressTracking: function () {
        clearInterval(this.onProgress.id);
    },

    onProgress: function () {
        const buffered = this.video.buffered;
        let length = buffered.length;

        while (length--) {
            const start = buffered.start(length) / this.video.duration * 100;
            const end = buffered.end(length) / this.video.duration * 100;

            this.controls.seekbar.buffered.setStyle('width', `${end - start}%`);
            this.fireEvent('progress');

            if (end - start == 100) {
                this.stopProgressTracking();
            }
        }
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
            tracks: serializedTracks,
            summary: this.options.summary,
            poster: this.options.poster
        });

        const items = [].concat(item, Array.convert(this.options.playlist));

        this.playlist = new Playlist(items);
    },

    buildPanels: function () {
        this.videoInfoPanel = new Element('div', {
            class: 'moovie-panel info-panel',
            html: `<header><h2>Video Information</h2></header>
                <button class="close">✖</button>
                <dl>
                    <dt class="title">Title</dt>
                    <dd>${this.playlist.current().title}</dd>
                    <dt class="url">URL</dt>
                    <dd>${this.video.src}</dd>
                    <dt class="size">Size</dt>
                    <dd>0 MB</dd>
                </dl>`,
            hidden: ''
        });

        this.aboutPanel = new Element('div', {
            class: 'moovie-panel about-panel',
            html: `<header><h2>About This Player</h2></header>
            <button class="close">✖</button>
            <p><strong>Moovie</strong> v0.4.3-<em>alpha</em></p>
            <p>Copyright &copy; 2010, Colin Aarts</p>
            <p><a href="http://colinaarts.com/code/moovie/" rel="external">http://colinaarts.com/code/moovie/</a></p>`,
            hidden: ''
        });

        this.element.adopt(this.videoInfoPanel, this.aboutPanel);

        $$(this.videoInfoPanel, this.aboutPanel).getElement('button.close')
            .addEvent('click', function () {
                this.getParent('.moovie-panel').set('hidden', '');
            });
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

        // hide appropriate playlist buttons
        this.controls.previous.set('aria-disabled', !this.playlist.hasPrevious());
        this.controls.next.set('aria-disabled', !this.playlist.hasNext());
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
        const settings = new Element('div.settings[aria-label="View Settings"]');
        const autohideControls = this.options.controls.autohide ? '[checked]' : '';
        //const loopVideo = this.video.loop ? '[checked]' : '';
        const renderTracks = this.renderer.disabled ? '' : '[checked]';
        const showDebugger = this.debugger.disabled ? '' : '[checked]';

        settings.popup = new Element('div.popup');
        settings.popup.adopt(
            new Element(`input[type=checkbox].moovie-checkbox#autohide-controls${autohideControls}`),
            new Element('label.moovie-label[for="autohide-controls"][text=Autohide Controls]'),
            //new Element(`input[type=checkbox].moovie-checkbox#loop-video${loopVideo}`),
            //new Element('label.moovie-label[for="loop-video"][text=Loop Video]'),
            new Element(`input[type=checkbox].moovie-checkbox#render-tracks${renderTracks}`),
            new Element('label.moovie-label[for="render-tracks"][text=Render Text Tracks]'),
            new Element(`input[type=checkbox].moovie-checkbox#show-debugger${showDebugger}`),
            new Element('label.moovie-label[for="show-debugger"][text=Show Debugger]')
        );

        settings.addEvent('click:relay(.moovie-checkbox)', (event) => {
            switch (event.target.id) {
                case 'autohide-controls':
                    this.options.controls.autohide = event.target.checked;
                    return;

                //case 'loop-video':
                    //this.video.loop = event.target.checked;
                    //return;

                case 'render-tracks':
                    this.renderer[event.target.checked ? 'enable' : 'disable']();
                    return;

                case 'show-debugger':
                    this.debugger[event.target.checked ? 'enable' : 'disable']();
                    return;

                // No Default
            }
        });

        settings.grab(settings.popup);

        return settings;
    },

    createMoreControl: function () {
        const more = new Element('div.more[aria-label="Show More Popup"]');

        more.popup = new Element('div.popup');
        more.about = new Element('div.about[aria-label=About Moovie]');
        more.about.addEvent('click', () => {
            this.videoInfoPanel.set('hidden', '');
            this.playlist.hide();
            this.aboutPanel.removeAttribute('hidden');
        });

        more.info = new Element('div.info[aria-label=View Video Info]');
        more.info.addEvent('click', () => {
            this.aboutPanel.set('hidden', '');
            this.playlist.hide();
            this.videoInfoPanel.removeAttribute('hidden');
        });

        more.playlist = new Element('div.playlist[aria-label=Show Playlist]');
        more.playlist.addEvent('click', () => {
            this.playlist.show();
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
