import expect from 'expectations';
import Slider from '../../../src/js/component/Slider.js';
import Component from '../../../src/js/core/Component.js';

describe('Slider', function () {
    it('gets exported as a default module', function () {
        expect(Slider).toBeDefined();
    });

    it('extends the `Component` class', function () {
        const slider = new Slider();

        expect(instanceOf(slider, Component)).toEqual(true);
    });

    it('is a registered component', function () {
        const exists = Object.keyOf(Component.registered, Slider);

        expect(exists).toEqual('slider');
    });
});
