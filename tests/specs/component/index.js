import expect from 'expectations';
import * as Component from '../../../src/js/component/index.js';

describe('component/index.js', function () {
    it('exports a `Button` component', function () {
        expect(Component.Button).toBeDefined();
    });

    it('exports a `Slider` component', function () {
        expect(Component.Slider).toBeDefined();
    });

    it('exports a `Tooltip` component', function () {
        expect(Component.Tooltip).toBeDefined();
    });
});
