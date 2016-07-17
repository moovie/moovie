// Here for compat with older MooTools versions...
Element.implement({
    show: function () {
        'use strict';

        this.setStyle('display', '');

        return this;
    },

    hide: function () {
        'use strict';

        this.setStyle('display', 'none');

        return this;
    }
});

/*!
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * @see http://colinaarts.com/code/moovie
 * @version 0.2.0
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
var Moovie = function(videos, options) {
    'use strict';

    options = options || {};

    videos.each(function(el) {
        if (typeOf(el) == 'element') {
            el.Moovie = new Moovie.Doit(el, options);
        } else if (typeOf(el) == 'object') {
            el.options = el.options || {};
            el.options.id = el.id || null;
            el.options.captions = Moovie.captions[el.id] || null;
            el.video.Moovie = new Moovie.Doit(el.video, Object.merge(options, el.options));
        }
    });
};

// Public static properties

// The main function, which handles one <video> at a time.
// <http://www.urbandictionary.com/define.php?term=Doit&defid=3379319>
Moovie.Doit = function(video, options) {

  video.controls = false;

  // Options
  var defaults = {
    debugger: false,
    autohideControls : true,
    title            : new URI(video.src).get('file'),
    playlist         : [],
    captions         : null,
    showCaptions     : true,
    captionLang      : 'en',
    plugins: ['Debugger']
  };

  options = Object.merge(defaults, options);

  // Add the current video to the playlist stack
  options.playlist.unshift({ id: options.id, src: video.src, title: options.title });

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


  // Add HTML 5 media events to Element.NativeEvents, if needed.
  if(!Element.NativeEvents.timeupdate) {
    Element.NativeEvents = Object.merge({ abort: 1, canplay: 1, canplaythrough: 1, durationchange: 1, emptied: 1, ended: 1, loadeddata: 1, loadedmetadata: 1, loadstart: 1, pause: 1, play: 1, playing: 1, progress: 2, ratechange: 1, seeked: 1, seeking: 1, stalled: 1, suspend: 1, timeupdate: 1, volumechange: 1, waiting: 1 }, Element.NativeEvents);
  }

  // Unfortunately, the media API only defines one volume-related event: `volumechange`. This event is fired whenever the media's `volume` attribute changes, or the media's `muted` attribute changes. The API defines no way to discern the two, so we'll have to "manually" keep track. We need to do this in order to be able to provide the advanced volume control (a la YouTube's player): changing the volume can have an effect on the muted state and vice versa.
  var muted = video.muted;
  var panelHeightSet = false;


  // Utility methods ---------------------------------------------------------

  // Parses a float value in seconds (from video.currentTime etc) to normal time format
  var parseTime = function(val) {
    var rest = 0, hrs = 0, mins = 0, secs = 0, time = '';

    hrs  = (val / 3600).toInt();
    rest = val % 3600;
    mins = (rest / 60).toInt();
    rest = rest % 60;
    secs = rest.toInt().toString();

    if(secs.length == 1) {
      secs = '0' + secs;
    }
    if(hrs !== 0) time += hrs + ':';
    return time + mins + ':' + secs;
  };

  // Calculates offset for progress bar slider based on page location
  var locToTime = function(val) {
    var barX     = controls.progress.bar.getPosition().x;
    var barW     = controls.progress.bar.getSize().x;
    var offsetPx = val - barX;
    var offsetPc = offsetPx / barW * 100;
    var time     = (video.duration || 0) / 100 * offsetPc;
    return time;
  };

  // Calculates offset for volume bar slider based on page location
  var locToVolume = function(val) {
    var barY     = controls.volume.bar.getPosition().y;
    var barH     = controls.volume.bar.getSize().y;
    var offsetPx = val - barY;
    var offsetPc = offsetPx / barH * 100;
    var volume   = 1 - (1 / 100 * offsetPc).limit(0, 1);
    return volume;
  };


  // Build interface =========================================================

  // Captions ----------------------------------------------------------------

  var captions     = new Element('div', { 'class': 'captions' });
  captions.caption = new Element('p');

  captions.grab(captions.caption);

  captions.hide();


  // Overlay -----------------------------------------------------------------
  var overlay       = new Element('div', { 'class': 'overlay' });
  overlay.wrapper   = new Element('div', { 'class': 'wrapper' });
  overlay.buffering = new Element('div', { 'class': 'buffering', text: 'Buffering...' });
  overlay.play      = new Element('div', { 'class': 'play', text: 'Play video' });
  overlay.replay    = new Element('div', { 'class': 'replay', text: 'Replay' });
  overlay.paused    = new Element('div', { 'class': 'paused', text: 'Paused' });

  overlay.wrapper.adopt(overlay.buffering, overlay.play, overlay.replay, overlay.paused);
  overlay.grab(overlay.wrapper);

  overlay.set('tween', { duration: 50 });
  overlay.fade('hide');


  // Title -------------------------------------------------------------------
  var title = new Element('div', { 'class': 'video-title', 'html': options.title });

  title.set('tween', { duration: 2000 });
  title.fade('hide');


  // Panels ------------------------------------------------------------------
  var panels      = new Element('div', { 'class': 'panels' });
  panels.info     = new Element('div', { 'class': 'info' });
  panels.settings = new Element('div', { 'class': 'settings' });
  panels.about    = new Element('div', { 'class': 'about' });
  panels.playlist = new Element('div', { 'class': 'playlist' });

  panels.adopt(panels.info, panels.settings, panels.about, panels.playlist);

  panels.set('tween', { duration: 250 });
  panels.fade('hide');

  // Content for `info` panel
  panels.info.set('html', '\
    <div class="heading">Video information</div>\
    <dl>\
      <dt class="title">Title</dt>\
      <dd>' + options.title + '</dd>\
      \
      <dt class="url">URL</dt>\
      <dd>' + video.src + '</dd>\
      \
      <dt class="size">Size</dt>\
      <dd></dd>\
    </dl>\
  ');

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

  options.playlist.each(function(el, index) {
    var active = index === 0 ? 'active' : '';
    panels.playlist.getElement('ol.playlist').grab(new Element('li', { 'data-index': index, 'class': active, 'html': '\
      <div class="checkbox-widget" data-checked="true">\
        <div class="checkbox"></div>\
        <div class="label">' + el.title + '</div>\
      </div>\
    ' }));
  });


  // Controls ----------------------------------------------------------------
  var controls               = new Element('div', { 'class': 'controls' });
  controls.wrapper           = new Element('div', { 'class': 'wrapper' });

  // General
  controls.play              = new Element('div', { 'class': 'play' });
  controls.stop              = new Element('div', { 'class': 'stop' });
  controls.currentTime       = new Element('div', { 'class': 'current-time', 'text': '0.00' });
  controls.duration          = new Element('div', { 'class': 'duration', 'text': '0.00' });
  controls.settings          = new Element('div', { 'class': 'settings', 'title': 'Settings' });
  controls.close             = new Element('div', { 'class': 'close', 'title': 'Close panel' });

  controls.previous = options.playlist.length > 1 ? new Element('div', { 'class': 'previous', 'title': 'Previous' }) : null;
  controls.next     = options.playlist.length > 1 ? new Element('div', { 'class': 'next', 'title': 'Next' }) : null;

  // Progress
  controls.progress          = new Element('div', { 'class': 'progress' });
  controls.progress.wrapper  = new Element('div', { 'class': 'wrapper' });
  controls.progress.bar      = new Element('div', { 'class': 'bar' });
  controls.progress.time     = new Element('div', { 'class': 'time' }).grab(new Element('div', { text: '0.00' }));
  controls.progress.buffered = new Element('div', { 'class': 'buffered' });
  controls.progress.played   = new Element('div', { 'class': 'played' });
  controls.progress.slider   = new Element('div', { 'class': 'slider' });

  controls.progress.wrapper.adopt(controls.progress.bar, controls.progress.buffered, controls.progress.played, controls.progress.slider, controls.progress.time);
  controls.progress.grab(controls.progress.wrapper);

  controls.progress.time.fade('hide');

  // Volume
  controls.volume            = new Element('div', { 'class': 'volume' });
  controls.volume.mute       = new Element('div', { 'class': 'mute' });
  controls.volume.wrapper    = new Element('div', { 'class': 'wrapper' });
  controls.volume.popup      = new Element('div', { 'class': 'popup' });
  controls.volume.bar        = new Element('div', { 'class': 'bar' });
  controls.volume.slider     = new Element('div', { 'class': 'slider' });

  controls.volume.popup.adopt(controls.volume.bar, controls.volume.slider);
  controls.volume.wrapper.adopt(controls.volume.mute, controls.volume.popup);
  controls.volume.grab(controls.volume.wrapper);

  controls.volume.popup.fade('hide');
  controls.volume.popup.set('tween', { duration: 150 });

  // "more"
  controls.more              = new Element('div', { 'class': 'more' });
  controls.more.wrapper      = new Element('div', { 'class': 'wrapper' });
  controls.more.popup        = new Element('div', { 'class': 'popup' });
  controls.more.about        = new Element('div', { 'class': 'about', 'title': 'About' });
  controls.more.info         = new Element('div', { 'class': 'info', 'title': 'Video info' });
  controls.more.playlist     = new Element('div', { 'class': 'playlist', 'title': 'Playlist' });

  controls.more.popup.adopt(controls.more.about, controls.more.info, controls.more.playlist);
  controls.more.wrapper.grab(controls.more.popup);
  controls.more.grab(controls.more.wrapper);

  controls.more.popup.fade('hide');
  controls.more.popup.set('tween', { duration: 150 });

  //
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
      controls.close
  );
  controls.grab(controls.wrapper);

  controls.set('tween', { duration: 150 });


  // Inject and do some post-processing --------------------------------------
  wrapper.adopt(captions, overlay, title, panels, controls);

  // Get the knob offsets for later
  controls.progress.slider.left = controls.progress.slider.getStyle('left').toInt();
  controls.volume.slider.top    = controls.volume.slider.getStyle('top').toInt();

  // Make sliders draggable
  $$(controls.progress.slider, controls.volume.slider).each(function(el) {
    var modifiers  = el.getParents('.progress').length ? { y: false } : { x: false };
    var onDrag     = el.getParents('.progress').length ? function(el, e) {
      var barX = controls.progress.bar.getPosition().x;
      var barW = controls.progress.bar.getSize().x;
      if(e.page.x < barX) {
        el.setStyle('left', el.left);
      } else if(e.page.x > barX + barW) {
        el.setStyle('left', el.left + barW);
      }
      controls.progress.time.update(true, e.page.x);
    } : function(el, e) {
      video.volume = locToVolume(e.page.y);
      var barY = controls.volume.bar.getPosition().y;
      var barH = controls.volume.bar.getSize().y;
      if(e.page.y < barY) {
        el.setStyle('top', el.top);
      } else if(e.page.y > barY + barH) {
        el.setStyle('top', el.top + barH);
      }
    };
    var onComplete = el.getParents('.progress').length ? function(el, e) {
      el.beingDragged = false;
      video.currentTime = locToTime(e.page.x);
      if(video.paused) {
        video.play();
      }
    } : function(el, e) {
      el.beingDragged = false;
    };

    el.drag = new Drag(el, {
      modifiers  : modifiers,
      snap       : 0,
      onStart    : function() {
        el.beingDragged = true;
      },
      onDrag     : onDrag,
      onComplete : onComplete,
      onCancel   : function() {
        el.beingDragged = true;
      }
    });

  }); // end each() for draggable sliders


  // Methods =================================================================

  // Overlay -----------------------------------------------------------------

  overlay.update = function(which) {
    if(which == 'none') {
      this.fade('out');
    } else {
      this.wrapper.getChildren().hide();
      this[which].show();
      this.fade('in');
    }
  };

  // Title -------------------------------------------------------------------

  title.show = function() {
    var index = panels.playlist.getActive().index;
    var text   = options.playlist[index].title;
    title.set('html', (index + 1).toString() + '. ' + text);
    title.fade('in');
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

  panels.playlist.play = function(action) {
    var current = panels.playlist.getActive();
    var active  = current.element;
    var index   = current.index;
    var length  = options.playlist.length;
    var which   = 0;

    if(action == 'previous') {
      which = index - 1;
      if(which < 0) {
        which = length - 1;
      }
    } else if(action == 'next') {
      which = index + 1;
      if(which > (length - 1)) {
        which = 0;
      }
    } else if(typeOf(action) == 'number') {
      which = action;
    }

    panels.playlist.setActive(which);

    video.src = options.playlist[which].src;
    video.load();
    video.play();

    options.captions = Moovie.captions[options.playlist[which].id];

    title.show();

    panels.info.getElement('dt.title + dd').set('html', (options.playlist[which].title || new URI(options.playlist[which].src).get('file')));
    panels.info.getElement('dt.url + dd').set('html', options.playlist[which].src);
  };

  panels.playlist.getActive = function() {
    var current = panels.playlist.getElement('ol.playlist li.active');
    var index   = +current.get('data-index');
    return { 'element': current, 'index': index };
};

  panels.playlist.setActive = function(which) {
    var active = panels.playlist.getActive().element;
    active.removeClass('active');
    panels.playlist.getElement('ol.playlist li[data-index="' + which + '"]').addClass('active');
};

  // Controls ----------------------------------------------------------------

  controls.play.update = function(action) {
    if(video.paused || video.ended) {
      this.removeClass('paused');
    } else {
      this.addClass('paused');
    }
  };

  controls.progress.update = function(action) {
    if(!controls.progress.slider.beingDragged) {
      var el     = controls.progress.slider;
      var pct    = video.currentTime / video.duration * 100;
      var width  = controls.progress.bar.getSize().x;
      var offset = (width / 100) * pct;
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
    this.getFirst().set('text', parseTime(locToTime(offset)));
  };

  controls.volume.update = function(action) {
    //var mutedChanged = !(muted == video.muted);
    var mutedChanged = muted != video.muted;
    muted = video.muted;

    if(mutedChanged && !video.muted && video.volume === 0) {
      // Un-muted with volume at 0 -- pick a sane default. This is probably the only deviation from the way the YouTube flash player handles volume control.
      video.volume = 0.5;
    } else if(video.muted && video.volume !== 0 && !mutedChanged) {
      // Volume changed while muted -> un-mute
      video.muted = false;
    } else if(!mutedChanged && !video.muted && video.volume === 0) {
      // Slider dragged to 0 -> mute
      video.muted = true;
    }

    if(video.muted) {
      controls.volume.mute.addClass('muted');
    } else {
      controls.volume.mute.removeClass('muted');
    }

    if(!controls.volume.slider.beingDragged) {
      var slider  = controls.volume.slider;
      var volume  = video.muted && mutedChanged ? 0 : video.volume; // If muted, assume 0 for volume to visualize the muted state in the slider as well. Don't actually change the volume, though, so when un-muted, the slider simply goes back to its former value.
      var barSize = controls.volume.bar.getSize().y;
      var offset  = barSize - volume * barSize;
      slider.setStyle('top', offset + slider.top);
    }
  }; // end controls.volume.update()

  controls.currentTime.update = controls.duration.update = function(time) {
    this.set('text', parseTime(time));
  };


  // Events ==================================================================

  // Masthead ----------------------------------------------------------------

    wrapper.addEvent('mouseenter', function(e) {
      controls.fade('in');
    });

    wrapper.addEvent('mouseleave', function(e) {
      if(options.autohideControls) {
        controls.fade('out');
      }
    });

  // Overlay -----------------------------------------------------------------

  $$(overlay.play, overlay.replay).addEvent('click', function(e) {
    video.play();
    title.show();
  });

  $$(overlay.paused).addEvent('click', function(e) {
    video.play();
  });

  // Panels ------------------------------------------------------------------

    // Checkbox widgets
    panels.settings.addEvent('click:relay(.checkbox-widget)', function (e) {
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
        }

        panels.update('none');
    });

    panels.playlist.addEvent('click:relay(.label)', function (e) {
        e.stop();

        var item  = this.getParents('li')[0];
        var index = item.get('data-index').toInt();

        panels.playlist.play(index);
        panels.update('none');
    });

  // Controls ----------------------------------------------------------------

  // Playback
  controls.play.addEvent('click', function(e) {
    if(video.paused && video.readyState >= 3) {
      video.play();
    } else if(!video.paused && video.ended) {
      video.currentTime = 0;
    } else if(!video.paused) {
      video.pause();
    }
  });

  controls.stop.addEvent('click', function(e) {
    video.currentTime = 0;
    video.pause();
  });

  if(options.playlist.length > 1) {
    controls.previous.addEvent('click', function(e) {
      panels.playlist.play('previous');
    });

    controls.next.addEvent('click', function(e) {
      panels.playlist.play('next');
    });
  }

  // Progress
  controls.progress.bar.addEvent('click', function(e) {
    video.currentTime = locToTime(e.page.x);
    if(video.paused) {
      video.play();
    }
  });

  controls.progress.bar.addEvent('mousemove', function(e) {
    controls.progress.time.update(e.page.x, false);
  });

  controls.progress.slider.addEvent('mouseenter', function(e) {
    controls.progress.time.update(e.page.x, true);
  });

  controls.progress.bar.addEvent('mouseleave', function(e) {
    controls.progress.time.fade('hide');
  });

  controls.progress.slider.addEvent('mouseleave', function(e) {
    controls.progress.time.fade('hide');
  });

  // Volume
  controls.volume.mute.addEvent('click', function(e) {
    if(video.muted) {
      video.muted = false;
    } else {
      video.muted = true;
    }
  });

  controls.volume.addEvent('mouseenter', function(e) {
    controls.volume.popup.fade('in');
  });

  controls.volume.addEvent('mouseleave', function(e) {
    controls.volume.popup.fade('out');
  });

  controls.volume.bar.addEvent('click', function(e) {
    video.volume = locToVolume(e.page.y);
  });

  // "more"
  controls.more.addEvent('mouseenter', function(e) {
    controls.more.popup.fade('in');
  });

  controls.more.addEvent('mouseleave', function(e) {
    controls.more.popup.fade('out');
  });

  controls.more.about.addEvent('click', function(e) {
    panels.update('about');
  });

  controls.more.info.addEvent('click', function(e) {
    panels.update('info');
  });

  controls.more.playlist.addEvent('click', function(e) {
    panels.update('playlist');
  });

  // Misc
  controls.settings.addEvent('click', function(e) {
    panels.update('settings');
  });

  controls.close.addEvent('click', function(e) {
    panels.update('none');
  });


  // Video element -----------------------------------------------------------
  video.addEvents({

    click: function(e) {
      video.pause();
      overlay.update('paused');
    },

    play: function(e) {
        controls.play.update();
        overlay.update('none');
        controls.show();
    },

    pause: function(e) {
      controls.play.update();
    },

    ended: function(e) {
      if(options.playlist.length > 1) {
        panels.playlist.play('next');
      } else {
        controls.play.update();
        overlay.update('replay');
      }
    },

    progress: function(e) {
      if(e.event.lengthComputable) {
        // Progress bar
        var pct = e.event.loaded / e.event.total * 100;
        controls.progress.buffered.setStyle('width', pct + '%');
        // Info panel
        var MB = (e.event.total / 1024 / 1024).round(2);
        panels.info.getElement('dt.size + dd').set('html', MB + ' MB');
      }
    },

    seeking: function(e) {
      overlay.update('buffering');
    },

    seeked: function(e) {
      overlay.update('none');
      if(!video.paused) {
        controls.play.update();
      }
    },

    timeupdate: function(e) {
      controls.currentTime.update(video.currentTime);
      controls.progress.update();

      // Captions
      var found = false;

      if(options.captions && options.showCaptions) {
        options.captions[options.captionLang].each(function(caption) {
          if(video.currentTime >= caption.start / 1000 && video.currentTime <= caption.end / 1000) {
            captions.caption.set('html', caption.text);
            captions.show();
            found = true;
          }
        });
      }

      if(!found) {
        captions.caption.set('html', '');
        captions.hide();
      }
    },

    durationchange: function(e) {
      controls.duration.update(video.duration);
    },

    volumechange: function(e) {
      controls.volume.update();
    },

    abort: function(e) {
      // video.Moovie = null;
      // Doit(video);
    },

    emptied: function(e) {
      // video.Moovie = null;
      // Doit(video);
    }

  }); // end events for video element


    // setup plugins...
    options.plugins.each(function (plugin) {
        var option = plugin.toLowerCase();
        var pluginOptions = {};
        plugin = Moovie[plugin];

        if (typeOf(options[option]) === 'boolean') {
            pluginOptions.disabled = !options[option];
            pluginOptions.container = container;
        } else {
            pluginOptions = options[option];
        }

        this[option] = new plugin(video, pluginOptions);

        console.log(this[option]);
    }, this);

    // Init ====================================================================
    if (!video.autoplay) {
        overlay.update('play');
        controls.hide();
    }

  var tips = new Tips(wrapper.getElements('[title]'), {
    className : 'video-tip',
    title     : '',
    text      : function(el) {
      return el.get('title');
    }
  });

}; // end Doit()

/*!
 * Moovie.Debugger: a plugin to allow Moovie players to view video info live.
 *
 * @version 0.2.0
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Debugger = new Class({
    Implements: [Options],

    options: {
        container: null,
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

        if (this.options.disabled) {
            this.build().disable();
        } else {
            this.build().enable();
        }
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

        if (document.id(this.options.container)) {
            this.element.inject(document.id(this.options.container));
        }

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
        this.element.set('data-disabled', false);
        this.attach();

        return this;
    },

    disable: function () {
        this.detach();
        this.element.set('data-disabled', true);

        return this;
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

            abort: function(e) {
                this.flashProperty('networkState')
                    .flashMessage('data fetching aborted...');
            }.bind(this),

            error: function(e) {
                this.flashProperty('networkState')
                    .flashProperty('error', this.video.error.code)
                    .flashMessage('an error occurred while fetching data...');
            }.bind(this),

            emptied: function(e) {
                this.flashProperty('networkState')
                    .flashMessage('media resource is empty...');
            }.bind(this),

            stalled: function(e) {
                this.flashProperty('networkState')
                    .flashMessage('stalled while fetching data...');
            }.bind(this),

            loadedmetadata: function(e) {
                this.flashProperty('readyState')
                    .flashMessage('duration and dimensions have been determined...');
            }.bind(this),

            loadeddata: function(e) {
                this.flashProperty('readyState')
                    .flashMessage('first frame is available...');
            }.bind(this),

            waiting: function(e) {
                this.flashProperty('readyState')
                    .flashMessage('waiting for more data...');
            }.bind(this),

            playing: function(e) {
                this.flashProperty('readyState')
                    .flashMessage('playback has started...');
            }.bind(this),

            canplay: function(e) {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played, but will likely be interrupted for buffering...');
            }.bind(this),

            canplaythrough: function(e) {
                this.flashProperty('readyState')
                    .flashMessage('media is ready to be played and will most likely play through without stopping...');
            }.bind(this),

            play: function(e) {
                this.flashProperty('paused');
            }.bind(this),

            pause: function(e) {
                this.flashProperty('paused');
            }.bind(this),

            ended: function(e) {
                this.flashProperty('paused')
                    .flashProperty('ended');
            }.bind(this),

            timeupdate: function(e) {
                this.flashProperty('currentTime', this.video.currentTime.round(3));
            }.bind(this),

            seeking: function(e) {
                this.flashProperty('seeking');
            }.bind(this),

            seeked: function(e) {
                this.flashProperty('seeking');
            }.bind(this),

            durationchange: function(e) {
                this.flashProperty('duration', this.video.duration.round(3));
            }.bind(this),

            ratechange: function(e) {
                this.flashProperty('playbackRate');
            }.bind(this),

            volumechange: function(e) {
                this.flashProperty('muted')
                    .flashProperty('volume', this.video.volume.round(2));
            }.bind(this)
        };
    }
});

Moovie.captions = {};

Moovie.languages = { // You can add additional language definitions here
  'en': 'English'
};

// Public static methods

Moovie.registerCaptions = function(id, captions) {
  this.captions[id] = captions;
};
