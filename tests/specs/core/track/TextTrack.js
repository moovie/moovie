import expect from 'expectations';
import TextTrack from '../../../../src/js/core/track/TextTrack.js';

describe('TextTrack', function () {
    it('gets exported as a module', function () {
        expect(TextTrack).toBeDefined();
    });

    it('cannot be contructed', function () {
        const actual = function () {
            return new TextTrack();
        };

        expect(actual).toThrow(TypeError);
    });

    it('cannot be called', function () {
        const actual = function () {
            return new TextTrack();
        };

        expect(actual).toThrow(TypeError);
    });

    describe('.create(kind, label, language)', function () {
        it('is a defined function', function () {
            expect(typeOf(TextTrack.create)).toBe('function');
        });

        it('returns a new `TextTrack` object with the correct state', function () {
            const textTrack = TextTrack.create();

            expect(textTrack instanceof TextTrack).toBe(true);
            expect(textTrack.kind).toEqual('subtitles');
            expect(textTrack.label).toEqual('');
            expect(textTrack.language).toEqual('');
            expect(textTrack.id).toEqual('');
            expect(textTrack.inBandMetadataTrackDispatchType).toEqual('');
            expect(textTrack.mode).toEqual('disabled');
            expect(textTrack.cues.length).toEqual(0);
            expect(textTrack.activeCues.length).toEqual(0);
        });

        context('when the `kind` argument is provided, it returns the `TextTrack`', function () {
            it('with the `kind` property set to the same value as the argument', function () {
                const textTrack = TextTrack.create('chapters');

                expect(textTrack.kind).toEqual('chapters');
            });

            it('or with the `kind` property set to "metadata" if the value is invalid', function () {
                const textTrack = TextTrack.create('foo');

                expect(textTrack.kind).toEqual('metadata');
            });
        });

        context('when the `label` argument is provided, it returns the `TextTrack`', function () {
            it('with the `label` property set to the same value as the argument', function () {
                const textTrack = TextTrack.create('subtitles', 'my label');

                expect(textTrack.label).toEqual('my label');
            });
        });

        context('when the `language` argument is provided, it returns the `TextTrack`', function () {
            it('with the `language` property set to the same value as the argument', function () {
                const textTrack = TextTrack.create('subtitles', '', 'en');

                expect(textTrack.language).toEqual('en');
            });
        });
    });

    describe('#addCue(cue)', function () {
        it('is a defined function', function () {
            const textTrack = TextTrack.create();

            expect(typeOf(textTrack.addCue)).toBe('function');
        });
    });

    describe('#removeCue(cue)', function () {
        it('is a defined function', function () {
            const textTrack = TextTrack.create();

            expect(typeOf(textTrack.removeCue)).toBe('function');
        });
    });
});
