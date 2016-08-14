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
import window from 'global/window';
import screenfull from 'screenfull';
import { WebVTT } from 'vtt.js';
import HTMLTrackElement from './texttracks/HTMLTrackElement.js';
import Debugger from './Debugger.js';
import Title from './Title.js';
import MediaEvents from './core/MediaEvents.js';
import Playlist from './Playlist.js';
import formatSeconds from './utils/formatSeconds.js';
import basename from './utils/basename.js';

const Moovie = new Class({
    Implements: [Options],

    options: {
        debugger: {},
        title: {},
        autohideControls: true,
        playlist: [],
        useNativeTextTracks: false,
        polyfill: false             // disables everything but controls (minimum-style) and overlay
    },

    initialize: function (video, options) {
        'use strict';

        this.setOptions(options);
        options = this.options;
        video = document.id(video);

        // Add HTML 5 media events to Element.NativeEvents, if needed.
        if (!Element.NativeEvents.timeupdate) {
            Element.NativeEvents = Object.merge(Element.NativeEvents, MediaEvents);
        }

        var playlist = [];

        // eslint-disable-next-line
        var hasFullscreenSupport = 'requestFullscreen' in document.createElement('div');
        var hasTrackSupport = 'track' in document.createElement('track');

        if (typeOf(options.playlist) === 'array') {
            playlist.combine(options.playlist);

            // Add the current video to the playlist stack
            playlist.unshift({
                id: video.get('id'),
                title: video.get('title') || basename(video.currentSrc || video.src),
                src: video.currentSrc || video.src,
                tracks: this.serializeTracks(video)
            });
        }

        this.playlist = new Playlist(playlist);

        // Grab some refs
        // @bug Native textTracks won't work unless the video is cloned.
        // @todo cloning no longer needed as we are rendering the text tracks ourselves
        var container = new Element('div.moovie');
        var wrapper = new Element('div.wrapper');
        container.replaces(video);
        var newVideo = video.clone(true, true);
        video.destroy();
        video = newVideo;
        wrapper.grab(video);
        container.grab(wrapper);
        this.video = video;
        this.wrapper = wrapper;

        // Unfortunately, the media API only defines one volume-related
        // event: `volumechange`. This event is fired whenever the media's
        // `volume` attribute changes, or the media's `muted` attribute
        // changes. The API defines no way to discern the two, so we'll
        // have to "manually" keep track. We need to do this in order to
        // be able to provide the advanced volume control (a la YouTube's
        // player): changing the volume can have an effect on the muted
        // state and vice versa.
        var muted = video.muted;
        var self = this;
        var current = this.playlist.current();

        var textTrackContainer = new Element('div.text-track-container');
        textTrackContainer.inject(video, 'after');

        this.overlay = new Element('div.overlay');
        this.title = new Title(this.options.title);
        this.title.update(current.title || basename(current.src));
        this.debugger = new Debugger(this.video, this.options.debugger);

        // Panels ------------------------------------------------------------------
        var panels      = new Element('div.panels');
        panels.info     = new Element('div.info');
        panels.settings = new Element('div.settings');
        panels.about    = new Element('div.about');

        panels.adopt(panels.info, panels.settings, panels.about, this.playlist);
        panels.set('aria-hidden', true);

        // Content for `info` panel
        panels.info.set('html', '\
            <div class="heading">Video information</div>\
            <dl>\
                <dt class="title">Title</dt>\
                <dd>' + this.playlist.current().title + '</dd>\
                \
                <dt class="url">URL</dt>\
                <dd>' + video.src + '</dd>\
                \
                <dt class="size">Size</dt>\
                <dd></dd>\
            </dl>\
        ');

        var autohideControls = options.autohideControls;
        var showCaptions = !!video.getChildren('track').length;

        // Content for `settings` panel
        panels.settings.set('html', '\
            <div class="heading">Settings</div>\
            \
            <div class="checkbox-widget" data-control="autohideControls" data-checked="' + autohideControls + '">\
                <div class="checkbox"></div>\
                <div class="label">Auto-hide controls</div>\
            </div>\
            <div class="checkbox-widget" data-control="loop" data-checked="' + (video.loop || false) + '">\
                <div class="checkbox"></div>\
                <div class="label">Loop video</div>\
            </div>\
            <div class="checkbox-widget" data-control="captions" data-checked="' + showCaptions + '">\
                <div class="checkbox"></div>\
                <div class="label">Show captions</div>\
            </div>\
            <div class="checkbox-widget" data-control="debugger" data-checked="' + !this.debugger.disabled + '">\
                <div class="checkbox"></div>\
                <div class="label">Enable Debugger</div>\
            </div>\
        ');

        // Content for `about` panel
        panels.about.set('html', '\
            <div class="heading">About this player</div>\
            <p><b>Moovie</b> v1.0 <i>alpha</i></p>\
            <p>Copyright Â© 2010, Colin Aarts</p>\
            <p><a href="http://colinaarts.com/code/moovie/" rel="external">http://colinaarts.com/code/moovie/</a></p>\
        ');

        this.panels = panels;

        // Controls ----------------------------------------------------------------
        this.buildControls();

        // Inject and do some post-processing --------------------------------------
        wrapper.adopt(this.overlay, this.title, panels, this.controls, this.debugger);

        // Get the knob offsets for later
        this.controls.seekbar.knob.left = this.controls.seekbar.knob.getStyle('left').toInt();
        this.controls.volume.knob.top = this.controls.volume.knob.getStyle('top').toInt();

        // Panels ------------------------------------------------------------------
        panels.update = function (which) {
            if (which == 'none' || this[which].hasClass('active')) {
                this.getChildren('.active').removeClass('active');
                this.set('aria-hidden', true);
            } else {
                self.playlist.hide();
                this.getChildren().removeClass('active');
                this[which].addClass('active');
                this.set('aria-hidden', false);
            }
        };

        textTrackContainer.update = function () {
            this.setStyles({
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: self.controls.getDimensions().y,
                'pointer-events': 'none'
            });

            if (hasTrackSupport) {
                self.disableNativeTextTracks();
            }

            self.implementTextTracks();
        };

        this.playlist.addEvent('show', function () {
            panels.update('none');
            this.element.addClass('active');
            panels.set('aria-hidden', false);
        });

        this.playlist.addEvent('hide', function () {
            panels.update('none');
            this.element.removeClass('active');
            panels.set('aria-hidden', true);
        });

        this.playlist.addEvent('select', function (current) {
            var trackElements = Array.convert(current.tracks).map(function (trackObj) {
                return new Element('track', trackObj);
            });

            panels.info.getElement('dt.title + dd').set('html', current.title || basename(current.src));
            panels.info.getElement('dt.url + dd').set('html', current.src);
            self.title.update(current.title || basename(current.src));
            self.title.show();

            video.getChildren('track').destroy();
            video.adopt(trackElements);
            video.poster = current.poster;
            video.src = current.src;

            video.load();
            video.play();
        });

        // Masthead ----------------------------------------------------------------
        wrapper.addEvent('mouseenter', function () {
            self.controls.show();
        });

        wrapper.addEvent('mouseleave', function () {
            if (options.autohideControls) {
                self.controls.hide();
            }
        });

        this.overlay.addEvent('click', function () {
            video.play();
            self.title.show();
        });

        // Panels ------------------------------------------------------------------
        panels.settings.addEvent('click:relay(.checkbox-widget)', function () {
            if (this.get('data-checked') == 'false') {
                this.set('data-checked', 'true');
            } else {
                this.set('data-checked', 'false');
            }

            var control = this.get('data-control');
            var checked = this.get('data-checked');

            switch (control) {
            case 'autohideControls':
                options.autohideControls = checked == 'true';
                break;

            case 'loop':
                video.loop = checked == 'true';
                break;

            case 'captions':
                textTrackContainer.setStyle('display', checked == 'true' ? 'block' : 'none');
                break;

            case 'debugger':
                self.debugger[checked !== 'true' ? 'disable' : 'enable']();
                break;
            }

            panels.update('none');
        });

        // Video element -----------------------------------------------------------
        video.addEvents({
            click: function() {
                video.pause();
            },

            play: function() {

            },

            playing: function () {
                container.set('data-playbackstate', 'playing');
                self.controls.show();
            },

            pause: function() {
                container.set('data-playbackstate', 'paused');
            },

            ended: function() {
                container.set('data-playbackstate', 'ended');
                self.playlist.next();
            },

            progress: function(e) {
                var percent = 0;
                var mb = 0;

                if (e.event.lengthComputable) {
                    mb = (e.event.total / 1024 / 1024).round(2);
                    percent = e.event.loaded / e.event.total * 100;
                } else if (video.buffered.length) {
                    var buffered = video.buffered.end(video.buffered.length - 1);
                    percent = buffered / video.duration * 100;
                }

                self.controls.seekbar.buffered.setStyle('width', percent + '%');
                panels.info.getElement('dt.size + dd').set('html', mb + ' MB');
            },

            seeking: function() {
                container.set('data-playbackstate', 'seeking');
            },

            seeked: function() {
                // @bug pressing stop button still shows "seeking" state. This get around that.
                if (video.paused) {
                    container.set('data-playbackstate', 'paused');
                }
            },

            timeupdate: function() {
                var pct = video.currentTime / video.duration * 100;
                var offset = self.controls.seekbar.track.getSize().x / 100 * pct;
                var pos = offset + self.controls.seekbar.knob.left;
                var trackElements = self.video.getChildren('track');
                var activeCues = [];

                self.controls.elapsed.set('text', formatSeconds(video.currentTime));
                self.controls.seekbar.played.setStyle('width', pct + '%');
                self.controls.seekbar.knob.setStyle('left', pos + 'px');

                Array.each(trackElements, function (trackElement) {
                    return activeCues.combine(trackElement.track.activeCues);
                });

                WebVTT.processCues(window, activeCues, wrapper.getElement('.text-track-container'));
            },

            durationchange: function() {
                self.controls.duration.set('text', formatSeconds(video.duration));
            },

            volumechange: function() {
                var mutedChanged = muted != video.muted;
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

                self.controls.volume.set('data-muted', video.muted);
                self.controls.volume.set('data-level', video.volume.round(2));

                // If muted, assume 0 for volume to visualize the
                // muted state in the slider as well. Don't actually
                // change the volume, though, so when un-muted, the
                // slider simply goes back to its former value.
                var volume  = video.muted && mutedChanged ? 0 : video.volume;
                var barSize = self.controls.volume.track.getSize().y;
                var offset  = barSize - volume * barSize;
                self.controls.volume.knob.setStyle('top', offset + self.controls.volume.knob.top);
            },

            abort: function() {
                // video.Moovie = null;
                // Doit(video);
            },

            loadstart: function () {
                textTrackContainer.update();
                //console.log('loadstart');
            }
        });

        // Init ====================================================================
        if (!video.autoplay) {
            container.set('data-playbackstate', 'stopped');
        }

        if (video.readyState >= 1) {
            textTrackContainer.update();
        }

        textTrackContainer.setStyle('display', showCaptions ? 'block' : 'none');

        // eslint-disable-next-line
        var tips = new Tips(wrapper.getElements('[title]'), {
            className: 'video-tip',
            title: '',
            text: function (el) {
                return el.get('title');
            }
        });
    },

    serializeTracks: function (video) {
        return video.getChildren('track')
            .map(function (trackElement) {
                var serialized = {};
                var attributes = trackElement.attributes;

                for (var i = 0, l = attributes.length; i < l; i++) {
                    serialized[attributes[i].name] = attributes[i].value;
                }

                return serialized;
            });
    },

    disableNativeTextTracks: function () {
        for (var i = 0, l = this.video.textTracks; i < l; i++) {
            this.video.textTracks[i].mode = 'disabled';
            //this.video.textTracks[i].mode = TextTrackMode.disabled;
        }
    },

    implementTextTracks: function () {
        this.video.getChildren('track').each(function (track) {
            new HTMLTrackElement(track);
        });
    },

    buildControls: function () {
        var self = this;
        var panels = this.panels;
        var video = this.video;

        this.controls = new Element('div.controls');
        this.controls.play = new Element('div.play[title=Play]');
        this.controls.play.addEvent('click', function () {
            if (video.paused && video.readyState >= 3) {
                video.play();
            } else if (!video.paused && video.ended) {
                video.currentTime = 0;
            } else if (!video.paused) {
                video.pause();
            }
        });

        this.controls.stop = new Element('div.stop[title=Stop]');
        this.controls.stop.addEvent('click', function () {
            video.currentTime = 0;
            video.pause();
        });

        this.controls.previous = new Element('div.previous[title=Previous]');
        this.controls.previous.addEvent('click', function () {
            self.playlist.previous();
        });

        this.controls.next = new Element('div.next[title=Next]');
        this.controls.next.addEvent('click', function () {
            self.playlist.next();
        });

        this.controls.elapsed = new Element('div.elapsed[text=0:00]');
        this.controls.seekbar = this.createSeekbar(video);
        this.controls.duration = new Element('div.duration[text=0:00]');
        this.controls.volume = this.createVolumeControl(video);
        this.controls.settings = new Element('div.settings[title=Settings]');
        this.controls.settings.addEvent('click', function () {
            panels.update('settings');
        });

        this.controls.more = this.createMoreControl(panels);
        this.controls.fullscreen = new Element('div.fullscreen[title=Fullscreen]');
        this.controls.fullscreen.addEvent('click', function () {
            screenfull.toggle(self.wrapper);
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
            this.controls.fullscreen
        );

        video.controls = false; // disable native controls

        this.controls.show = function () {
            return this.set('aria-hidden', false);
        };

        this.controls.hide = function () {
            return this.set('aria-hidden', true);
        };
    },

    createSeekbar: function (video) {
        var seekbar = new Element('div.seekbar');

        var locToTime = function (val) {
            var barX     = seekbar.track.getPosition().x;
            var barW     = seekbar.track.getSize().x;
            var offsetPx = val - barX;
            var offsetPc = offsetPx / barW * 100;
            var time     = (video.duration || 0) / 100 * offsetPc;
            return time;
        };

        seekbar.addEvent('mousedown', function (e) {
            function update(e) {
                var offset = e.page.x - seekbar.track.getPosition().x;
                var pct = offset / seekbar.track.getSize().x;

                video.pause();
                video.currentTime = (pct * video.duration).limit(0, video.duration);
            }

            function move(e) {
                update(e);
            }

            function stop() {
                document.removeEvent('mousemove', move);
                document.removeEvent('mouseup', stop);
                video.play();
            }

            document.addEvent('mousemove', move);
            document.addEvent('mouseup', stop);

            update(e);
        });

        seekbar.slider = new Element('div.slider');
        seekbar.slider.addEvents({
            mousemove: function (e) {
                var barX = seekbar.track.getPosition().x;
                var sliderX = seekbar.knob.getPosition().x;
                var pos, time;

                // does the "snap" like effect when the mouse is over the slider's knob
                if (e.target == seekbar.knob) {
                    pos = sliderX - barX - seekbar.knob.left;
                    time = sliderX - seekbar.knob.left;
                    time = formatSeconds(locToTime(time));
                } else {
                    pos = e.page.x - barX;
                    time = formatSeconds(locToTime(e.page.x));
                }

                seekbar.time.set('data-displaystate', 'showing');
                seekbar.time.setStyle('left', pos + 'px');
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

    createVolumeControl: function (video) {
        var volume = new Element('div.volume[title=Mute]');

        volume.addEvent('click', function () {
            video.muted = !video.muted;
        });

        volume.popup = new Element('div.popup');
        volume.popup.addEvent('click', function (e) {
            // stop child elements from triggering the mute when clicked
            e.stop();
        });

        volume.slider = new Element('div.slider');
        volume.slider.addEvent('mousedown', function (e) {
            function update(e) {
                var offset = e.page.y - volume.track.getPosition().y;
                var pct = offset / volume.track.getSize().y;

                video.volume = (1 - (pct * 1)).limit(0, 1);
            }

            function move(e) {
                update(e);
            }

            function stop() {
                document.removeEvent('mousemove', move);
                document.removeEvent('mouseup', stop);
            }

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

    createMoreControl: function (panels) {
        var more = new Element('div.more');
        var self = this;

        more.popup = new Element('div.popup');
        more.about = new Element('div.about[title=About]');
        more.about.addEvent('click', function () {
            panels.update('about');
        });

        more.info = new Element('div.info[title=Video info]');
        more.info.addEvent('click', function () {
            panels.update('info');
        });

        more.playlist = new Element('div.playlist[title=Playlist]');
        more.playlist.addEvent('click', function () {
            if (self.playlist.hidden) {
                self.playlist.show();
            } else {
                self.playlist.hide();
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
