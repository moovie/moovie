import expect from 'expectations';
import Slider from '../../../src/js/component/Slider.js';
import Base from '../../../src/js/component/Base.js';

describe('Slider', function () {
    it('gets exported as a default module', function () {
        expect(Slider).toBeDefined();
    });

    it('extends the `Base` class', function () {
        const slider = new Slider();

        expect(slider instanceof Base).toEqual(true);
    });
});
