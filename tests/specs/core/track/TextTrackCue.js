import expect from 'expectations';
import TextTrackCue from '../../../../src/js/core/track/TextTrackCue.js';

// Because `TextTrackCue` can only be subclassed, we'll
// need a dummy class to test some of the public API.
class TestCue extends TextTrackCue {}

describe('TextTrackCue', function () {
    it('gets exported as a module', function () {
        expect(TextTrackCue).toBeDefined();
    });

    it('is available globally', function () {
        expect(window.TextTrackCue).toBeDefined();
    });

    it('is an "event target"', function () {
        const cue = new TestCue();

        expect(cue instanceof EventTarget).toBe(true);
    });

    it('cannot be constructed directly', function () {
        const actual = function () {
            return new TextTrackCue();
        };

        expect(actual).toThrow(TypeError);
    });

    it('cannot be called directly', function () {
        const actual = function () {
            TextTrackCue();
        };

        expect(actual).toThrow(TypeError);
    });

    it('can be subclassed', function () {
        const cue = new TestCue();

        expect(cue instanceof TextTrackCue).toBe(true);
        expect(cue instanceof TestCue).toBe(true);
    });
});
