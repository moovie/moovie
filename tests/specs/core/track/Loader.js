import expect from 'expectations';
import Loader from '../../../../src/js/core/track/Loader.js';

describe('Loader', function () {
    it('gets exported as a default module', function () {
        expect(Loader).toBeDefined();
    });
});
