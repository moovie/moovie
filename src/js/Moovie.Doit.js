/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * The main function, which handles one <video> at a time.
 *
 * @see http://www.urbandictionary.com/define.php?term=Doit&defid=3379319
 * @version 0.3.3
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
        captions: null,
        showCaptions: true,
        captionLang: 'en',
        plugins: ['Debugger']
    },

    initialize: function (video, options) {
        'use strict';

        this.setOptions(options);
        options = this.options;
        video.controls = false;

        var playlist = [];

        var basename = function (str, suffix) {
            return str.substr(str.lastIndexOf(suffix || '/') + 1);
        };

        if (typeOf(options.playlist) === 'array') {
            playlist.combine(options.playlist);

            // Add the current video to the playlist stack
            playlist.unshift({
                id: video.get('id'),
                src: video.currentSrc || video.src,
                title: video.get('title') || basename(video.currentSrc || video.src)
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

        // Calculates offset for progress bar slider based on page location
        var locToTime = function(val) {
            var barX     = controls.progress.bar.getPosition().x;
            var barW     = controls.progress.bar.getSize().x;
            var offsetPx = val - barX;
            var offsetPc = offsetPx / barW * 100;
            var time     = (video.duration || 0) / 100 * offsetPc;
            return time;
        };

        // Captions ----------------------------------------------------------------
        var captions     = new Element('div.captions');
        captions.caption = new Element('p');

        captions.grab(captions.caption);
        captions.hide();

        this.overlay = new Element('div.overlay');

        // Title -------------------------------------------------------------------
        var title = new Element('div.video-title', {
            'html': this.playlist.current().title
        });

        title.set('tween', { duration: 2000 });
        title.fade('hide');

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
            <div class="checkbox-widget" data-control="showCaptions" data-checked="' + options.showCaptions + '">\
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
                        <div class="label">' + (el.title || basename(el.src)) + '</div>\
                      </div>\
                    '
                }));
        }, this.playlist);

        // Controls ----------------------------------------------------------------
        var controls        = new Element('div.controls');
        controls.wrapper    = new Element('div.wrapper');

        // General
        controls.play           = new Element('div.play');
        controls.stop           = new Element('div.stop');
        controls.currentTime    = new Element('div.current-time[text=0:00]');
        controls.duration       = new Element('div.duration[text=0:00]');
        controls.settings       = new Element('div.settings[title=Settings]');
        controls.fullscreen     = new Element('div.fullscreen[title=Fullscreen]');

        controls.previous = this.playlist.size ? new Element('div.previous[title=Previous]') : null;
        controls.next = this.playlist.size ? new Element('div.next[title=Next]') : null;

        // Progress
        controls.progress           = new Element('div.progress');
        controls.progress.wrapper   = new Element('div.wrapper');    // track
        controls.progress.bar       = new Element('div.bar');
        controls.progress.time      = new Element('div.time').grab(new Element('div[text=0:00]'));
        controls.progress.buffered  = new Element('div.buffered');
        controls.progress.played    = new Element('div.played');
        controls.progress.slider    = new Element('div.slider');

        controls.progress.wrapper.adopt(controls.progress.bar, controls.progress.buffered, controls.progress.played, controls.progress.slider, controls.progress.time);
        controls.progress.grab(controls.progress.wrapper);
        controls.progress.time.fade('hide');

        var seekbar = controls.progress;
        seekbar.addEvent('mousedown', function (e) {
            function update(e) {
                video.pause();
                var offset = e.page.x - seekbar.bar.getPosition().x;
                var pct = offset / seekbar.bar.getSize().x;
                video.currentTime = (pct * video.duration).limit(0, video.duration);
            }

            function move(e) {
                update(e);
            }

            function stop() {
                video.play();
                document.removeEvent('mousemove', move);
                document.removeEvent('mouseup', stop);
            }

            document.addEvent('mousemove', move);
            document.addEvent('mouseup', stop);

            update(e);
        });

        // Volume
        controls.volume         = new Element('div.volume');
        controls.volume.mute    = new Element('div.mute');
        controls.volume.wrapper = new Element('div.wrapper');
        controls.volume.popup   = new Element('div.popup');
        controls.volume.bar     = new Element('div.bar');
        controls.volume.slider  = new Element('div.slider');

        controls.volume.popup.adopt(controls.volume.bar, controls.volume.slider);
        controls.volume.wrapper.adopt(controls.volume.mute, controls.volume.popup);
        controls.volume.grab(controls.volume.wrapper);

        controls.volume.popup.fade('hide');
        controls.volume.popup.set('tween', { duration: 150 });

        controls.volume.popup.addEvent('mousedown', function (e) {
            function update(e) {
                var offset = e.page.y - controls.volume.bar.getPosition().y;
                var pct = offset / controls.volume.bar.getSize().y;
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

        // "more"
        controls.more           = new Element('div.more');
        controls.more.wrapper   = new Element('div.wrapper');
        controls.more.popup     = new Element('div.popup');
        controls.more.about     = new Element('div.about[title=About]');
        controls.more.info      = new Element('div.info[title=Video info]');
        controls.more.playlist  = new Element('div.playlist[title=Playlist]');

        controls.more.popup.adopt(controls.more.about, controls.more.info, controls.more.playlist);
        controls.more.wrapper.grab(controls.more.popup);
        controls.more.grab(controls.more.wrapper);

        controls.more.popup.fade('hide');
        controls.more.popup.set('tween', { duration: 150 });
        controls.wrapper.adopt(
            controls.play,
            controls.stop,
            controls.previous,
            controls.next,
            controls.currentTime,
            controls.progress,
            controls.duration,
            controls.volume,
            controls.settings,
            controls.more,
            controls.fullscreen
        );

        controls.grab(controls.wrapper);
        controls.set('tween', { duration: 150 });

        // Inject and do some post-processing --------------------------------------
        wrapper.adopt(captions, this.overlay, title, panels, controls);

        // Get the knob offsets for later
        controls.progress.slider.left = controls.progress.slider.getStyle('left').toInt();
        controls.volume.slider.top    = controls.volume.slider.getStyle('top').toInt();

        // Title -------------------------------------------------------------------
        title.show = function() {
            var index = self.playlist.index;
            var text   = self.playlist.current().title || basename(self.playlist.current().src);
            title.set('html', (index + 1).toString() + '. ' + text);
            title.fade('in');

            // eslint-disable-next-line
            var timer = setTimeout(function() {
                title.fade('out');
                timer = null;
            }, 6000);
        };

        // Panels ------------------------------------------------------------------
        panels.update = function (which) {
            // Adjust height of panel container to account for controls bar
            if (panelHeightSet === false) {
                panelHeightSet = true;
                panels.setStyle('height', panels.getStyle('height').toInt() - controls.getStyle('height').toInt());
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

            panels.info.getElement('dt.title + dd').set('html', current.title || basename(current.src));
            panels.info.getElement('dt.url + dd').set('html', current.src);

            options.captions = Moovie.captions[current.id];

            video.src = current.src;
            video.load();
            video.play();
            title.show();
        };

        // Controls ----------------------------------------------------------------
        controls.progress.update = function() {
            if(!controls.progress.slider.beingDragged) {
                var el     = controls.progress.slider;
                var pct    = video.currentTime / video.duration * 100;
                var width  = controls.progress.bar.getSize().x;
                var offset = width / 100 * pct;
                el.setStyle('left', offset + el.left + 'px');
            }
        };

        controls.progress.time.update = function(offset, slider) {
            controls.progress.time.fade('show');
            var barX = controls.progress.bar.getPosition().x;
            if(!slider) {
                controls.progress.time.setStyle('left', offset - barX + 'px');
            } else {
                var sliderX = controls.progress.slider.getPosition().x;
                controls.progress.time.setStyle('left', sliderX - barX - controls.progress.slider.left + 'px');
                offset = sliderX - controls.progress.slider.left;
            }
            this.getFirst().set('text', Moovie.Util.formatTime(locToTime(offset)));
        };

        controls.volume.update = function() {
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

            if (video.muted) {
                controls.volume.mute.addClass('muted');
            } else {
                controls.volume.mute.removeClass('muted');
            }

            if (!controls.volume.slider.beingDragged) {
                var slider  = controls.volume.slider;
                var volume  = video.muted && mutedChanged ? 0 : video.volume; // If muted, assume 0 for volume to visualize the muted state in the slider as well. Don't actually change the volume, though, so when un-muted, the slider simply goes back to its former value.
                var barSize = controls.volume.bar.getSize().y;
                var offset  = barSize - volume * barSize;
                slider.setStyle('top', offset + slider.top);
            }
        };

        controls.currentTime.update = controls.duration.update = function(time) {
            this.set('text', Moovie.Util.formatTime(time));
        };

        // Masthead ----------------------------------------------------------------
        wrapper.addEvent('mouseenter', function() {
            controls.fade('in');
        });

        wrapper.addEvent('mouseleave', function() {
            if (options.autohideControls) {
                controls.fade('out');
            }
        });

        this.overlay.addEvent('click', function () {
            video.play();
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

            case 'showCaptions':
                options.showCaptions = checked == 'true';
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

        // Playback
        controls.play.addEvent('click', function() {
            if(video.paused && video.readyState >= 3) {
                video.play();
            } else if(!video.paused && video.ended) {
                video.currentTime = 0;
            } else if(!video.paused) {
                video.pause();
            }
        });

        controls.stop.addEvent('click', function() {
            video.currentTime = 0;
            video.pause();
        });

        if (this.playlist.size()) {
            controls.previous.addEvent('click', function () {
                if (self.playlist.hasPrevious()) {
                    self.playlist.previous();
                    panels.playlist.update();
                }
            });

            controls.next.addEvent('click', function () {
                if (self.playlist.hasNext()) {
                    self.playlist.next();
                    panels.playlist.update();
                }
            });
        }

        // Progress
        controls.progress.bar.addEvent('mousemove', function(e) {
            controls.progress.time.update(e.page.x, false);
        });

        controls.progress.slider.addEvent('mouseenter', function(e) {
            controls.progress.time.update(e.page.x, true);
        });

        controls.progress.bar.addEvent('mouseleave', function() {
            controls.progress.time.fade('hide');
        });

        controls.progress.slider.addEvent('mouseleave', function() {
            controls.progress.time.fade('hide');
        });

        // Volume
        controls.volume.mute.addEvent('click', function() {
            video.muted = !video.muted;
        });

        controls.volume.addEvent('mouseenter', function() {
            controls.volume.popup.fade('in');
        });

        controls.volume.addEvent('mouseleave', function() {
            controls.volume.popup.fade('out');
        });

        // "more"
        controls.more.addEvent('mouseenter', function() {
            controls.more.popup.fade('in');
        });

        controls.more.addEvent('mouseleave', function() {
            controls.more.popup.fade('out');
        });

        controls.more.about.addEvent('click', function() {
            panels.update('about');
        });

        controls.more.info.addEvent('click', function() {
            panels.update('info');
        });

        controls.more.playlist.addEvent('click', function() {
            panels.update('playlist');
        });

        // Misc
        controls.settings.addEvent('click', function() {
            panels.update('settings');
        });

        controls.fullscreen.addEvent('click', function () {
            screenfull.toggle(wrapper);
        });


        // Video element -----------------------------------------------------------
        video.addEvents({
            click: function() {
                video.pause();
            },

            play: function() {
                controls.show();
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

                controls.progress.buffered.setStyle('width', percent + '%');
                panels.info.getElement('dt.size + dd').set('html', mb + ' MB');
            },

            seeking: function() {
                container.set('data-playbackstate', 'seeking');
            },

            seeked: function() {
            },

            timeupdate: function() {
                var pct = video.currentTime / video.duration * 100;

                controls.currentTime.update(video.currentTime);
                controls.progress.update();
                controls.progress.played.setStyle('width', pct + '%');

                // Captions
                var found = false;

                if (options.captions && options.showCaptions) {
                    options.captions[options.captionLang].each(function(caption) {
                        if(video.currentTime >= caption.start / 1000 && video.currentTime <= caption.end / 1000) {
                            captions.caption.set('html', caption.text);
                            captions.show();
                            found = true;
                        }
                    });
                }

                if (!found) {
                    captions.caption.set('html', '');
                    captions.hide();
                }
            },

            durationchange: function() {
                controls.duration.update(video.duration);
            },

            volumechange: function() {
                controls.volume.update();
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
            controls.hide();
        }

        // eslint-disable-next-line
        var tips = new Tips(wrapper.getElements('[title]'), {
            className: 'video-tip',
            title: '',
            text: function (el) {
                return el.get('title');
            }
        });
    }
});
