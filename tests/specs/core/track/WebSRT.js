import expect from 'expectations';
import WebSRT from '../../../../src/js/core/track/WebSRT.js';

describe('WebSRT', function () {
    it('gets exported as a named module', function () {
        expect(WebSRT).toBeDefined();
    });
});
