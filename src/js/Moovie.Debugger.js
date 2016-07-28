/**
 * Moovie: an advanced HTML5 video player for MooTools.
 *
 * A plugin to allow Moovie players to view video info live.
 *
 * @version 0.3.1
 * @author Colin Aarts <colin@colinaarts.com> (http://colinaarts.com)
 * @author Nathan Bishop <nbish11@hotmail.com>
 * @copyright 2010 Colin Aarts
 * @license MIT
 */
Moovie.Debugger = new Class({   // eslint-disable-line
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
        'use strict';

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
        'use strict';

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
        'use strict';

        this.video.addEvents(this.bound);

        return this;
    },

    detach: function () {
        'use strict';

        this.video.removeEvents(this.bound);

        return this;
    },

    enable: function () {
        'use strict';

        this.element.set('data-disabled', false);
        this.attach();

        return this;
    },

    disable: function () {
        'use strict';

        this.detach();
        this.element.set('data-disabled', true);

        return this;
    },

    flashProperty: function (property, value) {
        'use strict';

        this.elements.tbody
            .getElement('[data-property=' + property + '] > td + td')
            .set('text', value || this.video[property])
            .getParent().highlight();

        return this;
    },

    flashMessage: function (message) {
        'use strict';

        this.elements.p.set('html', message).highlight();

        return this;
    },

    toElement: function () {
        'use strict';

        return this.element;
    },

    getBoundEvents: function () {
        'use strict';

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
