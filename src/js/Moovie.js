/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * @see http://colinaarts.com/code/moovie
 * @version 0.3.2
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
var Moovie = function(videos, options) {
    'use strict';

    options = options || {};

    // Here for compat with older MooTools versions...
    Element.implement({
        show: function () {
            return this.setStyle('display', '');
        },

        hide: function () {
            return this.setStyle('display', 'none');
        }
    });

    // Add HTML 5 media events to Element.NativeEvents, if needed.
    if (!Element.NativeEvents.timeupdate) {
        Element.NativeEvents = Object.merge(Element.NativeEvents, Moovie.MediaEvents);
    }

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

Moovie.captions = {};
Moovie.languages = {
    'en': 'English'
};

Moovie.registerCaptions = function (id, captions) {
    'use strict';

    this.captions[id] = captions;
};
