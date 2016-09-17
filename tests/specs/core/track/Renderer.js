import expect from 'expectations';
import Renderer from '../../../../src/js/core/track/Renderer.js';

describe('Renderer', function () {
    it('gets exported as a default module', function () {
        expect(Renderer).toBeDefined();
    });
});
