import expect from 'expectations';
import { WebSRT, SRTCue } from '../../../src/js/track/WebSRT.js';

describe('WebSRT', function () {
    it('gets exported as a named module', function () {
        expect(WebSRT).toBeDefined();
    });
});

describe('SRTCue', function () {
    it('gets exported as a named module', function () {
        expect(SRTCue).toBeDefined();
    });
});
