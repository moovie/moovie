import TextTrackMode from '../../../src/js/track/TextTrackMode.js';

describe('TextTrackMode', function () {
    it('gets exported as a default module', function () {
        expect(TextTrackMode).toBeDefined();
    });

    it('matches the W3C spec', function () {
        expect(TextTrackMode.disabled).toEqual('disabled');
        expect(TextTrackMode.hidden).toEqual('hidden');
        expect(TextTrackMode.showing).toEqual('showing');
    });
});
