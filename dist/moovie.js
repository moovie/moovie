/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * @see http://colinaarts.com/code/moovie
 * @version 0.4.1
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
var Moovie = new Class({
    Implements: [Options],

    options: {
        debugger: {},
        title: {},
        autohideControls: true,
        playlist: []
    },

    initialize: function (video, options) {
        'use strict';

        this.setOptions(options);
        options = this.options;
        video = document.id(video);

        // Add HTML 5 media events to Element.NativeEvents, if needed.
        if (!Element.NativeEvents.timeupdate) {
            Element.NativeEvents = Object.merge(Element.NativeEvents, Moovie.MediaEvents);
        }

        var playlist = [];

        if (typeOf(options.playlist) === 'array') {
            playlist.combine(options.playlist);

            // Add the current video to the playlist stack
            playlist.unshift({
                id: video.get('id'),
                src: video.currentSrc || video.src,
                title: video.get('title') || Moovie.Util.basename(video.currentSrc || video.src)
            });
        }

        this.playlist = new Moovie.Playlist(playlist);

        // Grab some refs
        // @bug Native textTracks won't work unless the video is cloned.
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

        this.overlay = new Element('div.overlay');
        this.title = new Moovie.Title(this.options.title);
        this.title.update(current.title || Moovie.Util.basename(current.src));
        this.debugger = new Moovie.Debugger(this.video, this.options.debugger);

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
        var showCaptions = !!video.getElement('track[default]');

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
            panels.info.getElement('dt.title + dd').set('html', current.title || Moovie.Util.basename(current.src));
            panels.info.getElement('dt.url + dd').set('html', current.src);
            self.title.update(current.title || Moovie.Util.basename(current.src));
            self.title.show();

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
                video.getElement('track[default]').track.mode = (checked === 'true' ? 'showing' : 'hidden');
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

                self.controls.elapsed.set('text', Moovie.Util.formatTime(video.currentTime));
                self.controls.seekbar.played.setStyle('width', pct + '%');
                self.controls.seekbar.knob.setStyle('left', pos + 'px');
            },

            durationchange: function() {
                self.controls.duration.set('text', Moovie.Util.formatTime(video.duration));
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

            emptied: function() {
                // video.Moovie = null;
                // Doit(video);
            }
        });

        // Init ====================================================================
        if (!video.autoplay) {
            container.set('data-playbackstate', 'stopped');
        }

        // eslint-disable-next-line
        var tips = new Tips(wrapper.getElements('[title]'), {
            className: 'video-tip',
            title: '',
            text: function (el) {
                return el.get('title');
            }
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
                    time = Moovie.Util.formatTime(locToTime(time));
                } else {
                    pos = e.page.x - barX;
                    time = Moovie.Util.formatTime(locToTime(e.page.x));
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

// Allows a group of or a single <video> element to be converted to Moovie instances procedurely.
Element.implement({
    toMoovie: function (options) {
        this.store('moovie', new Moovie(this, options));
    }
});

/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * A plugin to allow Moovie players to view video info live.
 *
 * @version 0.4.1
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Debugger = new Class({
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

        this.options.monitorProperties.each(function (el) {
            var row = new Element('tr[data-property=' + el + ']');
            var label = new Element('td[text=' + el + ']');
            var value = new Element('td[text=' + this.video[el] + ']');

            row.adopt(label, value);
            this.elements.tbody.grab(row);
        }, this);

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
            .getElement('[data-property=' + property + '] > td + td')
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
            loadstart: function () {
                this.flashProperty('networkState')
                    .flashMessage('looking for data...');
            }.bind(this),

            progress: function () {
                this.flashProperty('networkState')
                    .flashMessage('fetching data...');
            }.bind(this),

            suspend: function () {
                this.flashProperty('networkState')
                    .flashMessage('data fetching suspended...');
            }.bind(this),

            abort: function () {
                this.flashProperty('networkState')
                    .flashMessage('data fetching aborted...');
            }.bind(this),

            error: function () {
                this.flashProperty('networkState')
                    .flashProperty('error', this.video.error.code)
                    .flashMessage('an error occurred while fetching data...');
            }.bind(this),

            emptied: function () {
                this.flashProperty('networkState')
                    .flashMessage('media resource is empty...');
            }.bind(this),

            stalled: function () {
                this.flashProperty('networkState')
                    .flashMessage('stalled while fetching data...');
            }.bind(this),

            loadedmetadata: function () {
                this.flashProperty('readyState')
                    .flashMessage('duration and dimensions have been determined...');
            }.bind(this),

            loadeddata: function () {
                this.flashProperty('readyState')
                    .flashMessage('first frame is available...');
            }.bind(this),

            waiting: function () {
                this.flashProperty('readyState')
                    .flashMessage('waiting for more data...');
            }.bind(this),

            playing: function () {
                this.flashProperty('readyState')
                    .flashMessage('playback has started...');
            }.bind(this),

            canplay: function () {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played, but will likely be interrupted for buffering...');
            }.bind(this),

            canplaythrough: function () {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played and will most likely play through without stopping...');
            }.bind(this),

            play: function () {
                this.flashProperty('paused');
            }.bind(this),

            pause: function () {
                this.flashProperty('paused');
            }.bind(this),

            ended: function () {
                this.flashProperty('paused')
                    .flashProperty('ended');
            }.bind(this),

            timeupdate: function () {
                this.flashProperty('currentTime', this.video.currentTime.round(3));
            }.bind(this),

            seeking: function () {
                this.flashProperty('seeking');
            }.bind(this),

            seeked: function () {
                this.flashProperty('seeking');
            }.bind(this),

            durationchange: function () {
                this.flashProperty('duration', this.video.duration.round(3));
            }.bind(this),

            ratechange: function () {
                this.flashProperty('playbackRate');
            }.bind(this),

            volumechange: function () {
                this.flashProperty('muted')
                    .flashProperty('volume', this.video.volume.round(2));
            }.bind(this)
        };
    }
});

/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Currently supported HTML5 media events.
 *
 * @version 0.4.1
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.MediaEvents = {
    abort: 1,
    canplay: 1,
    canplaythrough: 1,
    durationchange: 1,
    emptied: 1,
    ended: 1,
    error: 1,
    loadeddata: 1,
    loadedmetadata: 1,
    loadstart: 1,
    pause: 1,
    play: 1,
    playing: 1,
    progress: 2,    // @todo change to "1"
    ratechange: 1,
    seeked: 1,
    seeking: 1,
    stalled: 1,
    suspend: 1,
    timeupdate: 1,
    volumechange: 1,
    waiting: 1
};

/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Allows manipulation of a collection of videos.
 *
 * @version 0.4.1
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Playlist = new Class({
    Implements: [Events, Options],

    options: {/*
        onShow: function () {},
        onHide: function () {},
        onSelect: function () {},*/
    },

    initialize: function (items) {
        this.items = typeOf(items) === 'array' ? items : [];
        this.index = this.items.length ? 0 : -1;
        this.build().attach().hide();
    },

    attach: function () {
        var self = this;

        this.element.addEvent('click:relay(.label)', function (e) {
            e.stop();

            var item = this.getParents('li')[0];
            var index = item.get('data-index').toInt();

            self.select(index);
            self.hide();
        });

        return this;
    },

    build: function () {
        this.element = new Element('div.playlist');

        this.element.set('html', '\
            <div><div class="heading">Playlist</div></div>\
            <div><ol class="playlist"></ol></div>\
        ');

        this.items.each(function(el, index) {
            this.element.getElement('ol.playlist')
                .grab(new Element('li', {
                    'data-index': index,
                    'class': this.current() === el ? 'active' : '',
                    'html': '\
                      <div class="checkbox-widget" data-checked="true">\
                        <div class="checkbox"></div>\
                        <div class="label">' + (el.title || Moovie.Util.basename(el.src)) + '</div>\
                      </div>\
                    '
                }));
        }, this);

        return this;
    },

    active: function () {
        return this.element.getElement('ol.playlist li.active');
    },

    show: function () {
        this.hidden = false;
        this.element.set('aria-hidden', false);
        this.fireEvent('show');

        return this;
    },

    hide: function () {
        this.hidden = true;
        this.element.set('aria-hidden', true);
        this.fireEvent('hide');

        return this;
    },

    size: function () {
        return this.items.length;
    },

    current: function () {
        return this.items[this.index] || null;
    },

    hasPrevious: function () {
        return this.index > 0;
    },

    previous: function () {
        return this.select(this.index - 1);
    },

    hasNext: function () {
        return this.index < this.items.length - 1;
    },

    next: function () {
        return this.select(this.index + 1);
    },

    select: function (index) {
        if (index >= 0 && index < this.items.length) {
            this.index = index;
            this.active().removeClass('active');
            this.element.getElement('ol.playlist li[data-index="' + index + '"]').addClass('active');
            this.fireEvent('select', this.current());
        }

        return this;
    },

    isHidden: function () {
        return this.hidden;
    },

    toElement: function () {
        return this.element;
    }
});

/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * The "Title" module for the Moovie player.
 *
 * @version 0.4.1
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Title = new Class({
    Implements: [Events, Options],

    options: {/*
        onShow: function () {},
        onHide: function () {},*/
        autohide: true,
        delay: 6000,
        hidden: true,
        content: ''
    },

    initialize: function (options) {
        this.setOptions(options).build();
        this[this.options.hidden ? 'hide' : 'show']();
    },

    build: function () {
        this.element = new Element('div.moovie-title');
        this.element.set('html', this.options.content);

        return this;
    },

    update: function (content) {
        this.element.set('html', content);

        return this;
    },

    show: function () {
        this.hidden = false;
        this.element.set('aria-hidden', false);
        this.fireEvent('show');

        // prevents a whole host of bugs
        if (this.id) {
            clearTimeout(this.id);
        }

        if (this.options.autohide) {
            this.id = this.hide.delay(this.options.delay, this);
        }

        return this;
    },

    hide: function () {
        this.hidden = true;
        this.element.set('aria-hidden', true);
        this.fireEvent('hide');

        return this;
    },

    isHidden: function () {
        return this.hidden;
    },

    toElement: function () {
        return this.element;
    }
});

/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * Commonly used functions for the Moovie library.
 *
 * @version 0.4.1
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Util = {
    formatTime: function (seconds) {
        var hh = Math.floor(seconds / 3600);
        var mm = Math.floor((seconds % 3600) / 60);
        var ss = Math.ceil((seconds % 3600) % 60);

        if (ss === 60) {
            ss = 0;
            mm = mm + 1;
        }

        if (ss < 10) {
            ss = '0' + ss;
        }

        if (mm === 60) {
            mm = 0;
            hh = hh + 1;
        }

        if (hh > 0 && mm < 10) {
            mm = '0' + mm;
        }

        if (hh === 0) {
            return mm + ':' + ss;
        } else {
            return hh + ':' + mm + ':' + ss;
        }
    },

    /**
     * Strip directory and suffix from filenames.
     *
     * @link http://locutus.io/php/basename/
     * @author Kevin van Zonneveld (http://kvz.io)
     * @author Ash Searle (http://hexmen.com/blog/)
     * @author Lincoln Ramsay
     * @author djmix
     * @author Dmitry Gorelenkov
     * @param  {string} path   [description]
     * @param  {string} suffix If specified, removes suffix from returned string.
     * @return {string}        [description]
     */
    basename: function (path, suffix) {
        var b = path;
        var lastChar = b.charAt(b.length - 1);

        if (lastChar === '/' || lastChar === '\\') {
            b = b.slice(0, -1);
        }

        b = b.replace(/^.*[\/\\]/g, '');

        if (typeof suffix === 'string' && b.substr(b.length - suffix.length) === suffix) {
            b = b.substr(0, b.length - suffix.length);
        }

        return b;
    }
};
