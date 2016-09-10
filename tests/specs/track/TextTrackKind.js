import expect from 'expectations';
import TextTrackKind from '../../../src/js/track/TextTrackKind.js';

describe('TextTrackKind', function () {
    it('gets exported as a default module', function () {
        expect(TextTrackKind).toBeDefined();
    });

    it('matches the W3C spec', function () {
        expect(TextTrackKind.subtitles).toEqual('subtitles');
        expect(TextTrackKind.captions).toEqual('captions');
        expect(TextTrackKind.descriptions).toEqual('descriptions');
        expect(TextTrackKind.chapters).toEqual('chapters');
        expect(TextTrackKind.metadata).toEqual('metadata');
    });
});
