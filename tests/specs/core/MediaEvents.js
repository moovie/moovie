import expect from 'expectations';
import MediaEvents from '../../../src/js/core/MediaEvents.js';

describe('MediaEvents', function () {
    it('gets exported as a default module', function () {
        expect(MediaEvents).toBeDefined();
    });
});
