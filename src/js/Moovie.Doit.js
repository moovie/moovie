/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * The main function, which handles one <video> at a time.
 *
 * @see http://www.urbandictionary.com/define.php?term=Doit&defid=3379319
 * @version 0.3.4
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Doit = new Class({
    Implements: [Options],

    options: {
        debugger: false,
        autohideControls: true,
        playlist: [],
        plugins: ['Debugger']
    },

    initialize: function (video, options) {
        'use strict';

        this.setOptions(options);
        options = this.options;

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
        var panelHeightSet = false;
        var self = this;
        var showControls = video.controls;

        this.overlay = new Element('div.overlay');
        this.buildTitle();

        // Panels ------------------------------------------------------------------
        var panels      = new Element('div.panels');
        panels.info     = new Element('div.info');
        panels.settings = new Element('div.settings');
        panels.about    = new Element('div.about');
        panels.playlist = new Element('div.playlist');

        panels.adopt(panels.info, panels.settings, panels.about, panels.playlist);
        panels.set('tween', { duration: 250 });
        panels.fade('hide');

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

        var debuggerEnabled = options.debugger === true || options.debugger.disabled === false;
        var showCaptions = !!video.getElement('track[default]');

        // Content for `settings` panel
        panels.settings.set('html', '\
            <div class="heading">Settings</div>\
            \
            <div class="checkbox-widget" data-control="autohideControls" data-checked="' + options.autohideControls + '">\
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
            <div class="checkbox-widget" data-control="debugger" data-checked="' + debuggerEnabled + '">\
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

        // Content for `playlist` panel
        panels.playlist.set('html', '\
            <div><div class="heading">Playlist</div></div>\
            <div><ol class="playlist"></ol></div>\
        ');

        this.playlist.items.each(function(el, index) {
            panels.playlist.getElement('ol.playlist')
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
        }, this.playlist);

        this.panels = panels;

        // Controls ----------------------------------------------------------------
        this.buildControls(showControls);

        // Inject and do some post-processing --------------------------------------
        wrapper.adopt(this.overlay, this.title, panels, this.controls);

        // Get the knob offsets for later
        this.controls.seekbar.knob.left = this.controls.seekbar.knob.getStyle('left').toInt();
        this.controls.volume.knob.top = this.controls.volume.knob.getStyle('top').toInt();

        // Panels ------------------------------------------------------------------
        panels.update = function (which) {
            // Adjust height of panel container to account for controls bar
            if (panelHeightSet === false) {
                panelHeightSet = true;
                panels.setStyle(
                    'height',
                    panels.getStyle('height').toInt() -
                    self.controls.getStyle('height').toInt()
                );
            }

            if (which == 'none' || this[which].hasClass('active')) {
                this.getChildren('.active').removeClass('active');
                this.fade('out');
            } else {
                this.getChildren().hide().removeClass('active');
                this[which].show().addClass('active');
                this.fade('in');
            }
        };

        panels.playlist.update = function () {
            var current = self.playlist.current();
            var index = self.playlist.index;

            panels.playlist.getElement('ol.playlist li.active').removeClass('active');
            panels.playlist.getElement('ol.playlist li[data-index="' + index + '"]').addClass('active');

            panels.info.getElement('dt.title + dd').set('html', current.title || Moovie.Util.basename(current.src));
            panels.info.getElement('dt.url + dd').set('html', current.src);

            video.src = current.src;
            video.load();
            video.play();
        };

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

            // re-enable controls once "big play button" has been clicked
            if (showControls) {
                self.controls.enable();
            }
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

        panels.playlist.addEvent('click:relay(.label)', function (e) {
            e.stop();

            var item  = this.getParents('li')[0];
            var index = item.get('data-index').toInt();

            self.playlist.select(index);
            panels.playlist.update();
            panels.update('none');
        });

        // Video element -----------------------------------------------------------
        video.addEvents({
            click: function() {
                video.pause();
            },

            play: function() {
                self.controls.show();
            },

            playing: function () {
                container.set('data-playbackstate', 'playing');
            },

            pause: function() {
                container.set('data-playbackstate', 'paused');
            },

            ended: function() {
                container.set('data-playbackstate', 'ended');

                if (self.playlist.hasNext()) {
                    self.playlist.next();
                    panels.playlist.update();
                    self.title.show();
                }
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

        // setup plugins...
        options.plugins.each(function (plugin) {
            var option = plugin.toLowerCase();
            var pluginOptions = {};

            if (typeOf(options[option]) === 'boolean') {
                pluginOptions.disabled = !options[option];
                pluginOptions.container = container;
            } else {
                pluginOptions = options[option];
            }

            this[option] = new Moovie[plugin](video, pluginOptions);
        }, this);

        // Init ====================================================================
        if (!video.autoplay) {
            container.set('data-playbackstate', 'stopped');

            // hide controls while "big play button" is showing
            if (showControls) {
                this.controls.disable();
            }
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

    buildTitle: function () {
        var self = this;
        var title = new Element('div.video-title', {
            'html': this.playlist.current().title
        });

        title.show = function() {
            var index = self.playlist.index;
            var text   = self.playlist.current().title || Moovie.Util.basename(self.playlist.current().src);
            title.set('html', (index + 1).toString() + '. ' + text);
            title.fade('in');

            // eslint-disable-next-line
            var timer = setTimeout(function() {
                title.fade('out');
                timer = null;
            }, 6000);
        };

        title.set('tween', { duration: 2000 });
        title.fade('hide');
        this.title = title;
    },

    buildControls: function (showControls) {
        var self = this;
        var panels = this.panels;
        var video = this.video;

        this.controls = new Element('div.controls');
        this.controls.wrapper = new Element('div.wrapper');
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
            if (self.playlist.hasPrevious()) {
                self.playlist.previous();
                panels.playlist.update();
                self.title.show();
            }
        });

        this.controls.next = new Element('div.next[title=Next]');
        this.controls.next.addEvent('click', function () {
            if (self.playlist.hasNext()) {
                self.playlist.next();
                panels.playlist.update();
                self.title.show();
            }
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

        this.controls.wrapper.adopt(
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

        this.controls.grab(this.controls.wrapper);
        video.controls = false; // disable native controls

        this.controls.show = function () {
            if (!this.disabled) {
                this.set('data-displaystate', 'showing');
            }

            return this;
        };

        this.controls.hide = function () {
            if (!this.disabled) {
                this.set('data-displaystate', 'hidden');
            }

            return this;
        };

        this.controls.enable = function () {
            this.disabled = false;
            this.set('data-displaystate', 'showing');

            return this;
        };

        this.controls.disable = function () {
            this.disabled = true;
            this.set('data-displaystate', 'disabled');

            return this;
        };

        this.controls[showControls ? 'enable' : 'disable']();
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
            panels.update('playlist');
        });

        more.popup.adopt(more.about, more.info, more.playlist);
        more.grab(more.popup);

        return more;
    }
});
