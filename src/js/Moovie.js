/**
 * Moovie: an advanced HTML5 video player for MooTools.
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
import 'fullscreen-api-polyfill';
import './core/MediaEvents.js';
import { formatSeconds, getAttributes } from './Utility.js';
import { WebVTT } from 'vtt.js';
import WebSRT from './core/track/WebSRT.js';
import TextTrack from './core/track/TextTrack.js';
import Renderer from './core/track/Renderer.js';
import Debugger from './plugin/Debugger.js';
import Title from './plugin/Title.js';
import Playlist from './plugin/Playlist.js';
import ControlBar from './plugin/ControlBar.js';

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
        controls: {},
        plugins: []
    },

    textTracks: [],
    muted: false,
    loop: false,

    initialize: function (video, options) {
        this.setVideo(video);
        this.setOptions(options);

        this.muted = this.video.muted;
        this.loop = this.video.loop;

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

        if (this.video.readyState === this.video.HAVE_ENOUGH_DATA) {
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
        const track = this.addTextTrack(options.kind, options.label, options.srclang);
        const getParser = function () {
            const ext = options.src.split('.').pop();

            switch (ext) {
                case 'srt':
                    return new WebSRT.Parser();
                case 'vtt':
                    return new WebVTT.Parser(window, WebVTT.StringDecoder());
                default:
                    throw new Error(`Unsupported file type: ${ext}`);
            }
        };

        fetch(options.src)
            .then(function (response) {
                return response.text();
            })
            .then(function (text) {
                const parser = getParser();

                parser.oncue = track.addCue;
                parser.parse(text);
                parser.flush(); // @todo make flush() method return a Promise
            });

        track.mode = options.default ? 'showing' : 'hidden';
    },

    addTextTrack: function (kind, label, language) {
        const track = TextTrack.create(kind, label, language);

        this.textTracks.push(track);

        return track;
    },

    build: function () {
        this.element = new Element('figure.moovie');
        this.element.wraps(this.video);

        this.buildPlaylist();

        const current = this.playlist.current();

        this.renderer = new Renderer(this);
        this.overlay = new Element('div.overlay');
        this.title = new Title(this.options.title);
        this.title.update(current.title);
        this.debugger = new Debugger(this.video, this.options.debugger);

        this.buildAboutPanel();
        this.controls = new ControlBar(this, this.options.controls);

        this.element.adopt(
            this.renderer,
            this.overlay,
            this.title,
            this.playlist,
            this.aboutPanel,
            this.controls,
            this.debugger
        );

        // Adjust text-track renderer height to account for controls
        $(this.renderer).setStyle('bottom', $(this.controls).getSize().y);
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
            this.title.update(current.title);
            this.title.show();

            current.tracks.forEach((trackObj) => {
                this.loadTextTrack(trackObj);
            });

            this.video.poster = current.poster;
            this.video.src = current.src;
            this.video.load();
            this.video.play();
        });

        this.playlist.addEvent('queuechange', () => {
            // hide appropriate playlist buttons
            this.controls.previous.set('disabled', !this.playlist.hasPrevious());
            this.controls.next.set('disabled', !this.playlist.hasNext());
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
        this.fireEvent('timeupdate');
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

        if (this.loop) {
            this.loop = false;
            this.controls.settings.getElement('#loop-video').checked = false;
            this.video.play();
        } else if (this.playlist.hasNext()) {
            this.playlist.next();
        }
    },

    play: function () {
        this.video.play();

        return this;
    },

    pause: function () {
        this.video.pause();

        return this;
    },

    stop: function () {
        const src = this.video.src;

        this.video.pause();
        this.video.src = '';
        this.video.load();

        // wait for previous tasks to finish then reload source...
        setTimeout(() => {
            this.video.src = src;
            this.video.load();
        }, 0);

        return this;
    },

    /**
     * Toggles the video playback state.
     * @return {Moovie} The current instance for method chaining.
     */
    togglePlayback: function () {
        if (this.video.paused || this.video.ended) {
            this.video.play();
        } else {
            this.video.pause();
        }

        return this;
    },

    startProgressTracking: function () {
        this.stopProgressTracking();
        this.onProgress.id = setInterval(this.onProgress, 500);
    },

    stopProgressTracking: function () {
        clearInterval(this.onProgress.id);
    },

    onProgress: function () {
        const buffered = this.video.buffered;
        let total = 0;

        for (let i = 0, l = buffered.length; i < l; i++) {
            total = total + buffered.end(i) - buffered.start(i);
        }

        total = total / this.video.duration * 100;

        this.controls.seekbar.buffered.setStyle('width', `${total}%`);
        this.fireEvent('progress');

        if (total === 100) {
            this.stopProgressTracking();
        }
    },

    buildPlaylist: function () {
        const tracks = this.video.getChildren('track');

        // destroy old track elements and load our new text tracks
        const serializedTracks = tracks.map((trackElement) => {
            const trackObject = getAttributes(trackElement);

            this.loadTextTrack(trackObject);
            trackElement.removeAttribute('default');
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

    buildAboutPanel: function () {
        this.aboutPanel = new Element('div', {
            class: 'moovie-panel about-panel',
            html: `<header><h2>About This Player</h2></header>
            <button class="close">✖</button>
            <p><strong>Moovie</strong> v0.4.3-<em>alpha</em></p>
            <p>Copyright &copy; 2010, Colin Aarts</p>
            <p><a href="http://colinaarts.com/code/moovie/" rel="external">http://colinaarts.com/code/moovie/</a></p>`,
            hidden: ''
        });

        this.element.grab(this.aboutPanel);
        this.aboutPanel.getElement('button.close')
            .addEvent('click', function () {
                this.getParent('.moovie-panel').set('hidden', '');
            });
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
