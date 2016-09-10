import expect from 'expectations';
import { basename, formatSeconds, getAttributes } from '../../src/js/Utility.js';

describe('Utility', function () {
    describe('.basename(path, suffix)', function () {
        it('returns the basename without stripping the query component', function () {
            expect(basename('ecra.php?p=1')).toEqual('ecra.php?p=1');
        });

        it('will still return the basename even if the path ends in a slash', function () {
            expect(basename('/some/path/')).toEqual('path');
        });

        it('will treat any path without slashes as a basename', function () {
            expect(basename('user')).toEqual('user');
        });

        context('when given a suffix', function () {
            it('will remove the suffix from the basename', function () {
                expect(basename('/www/site/home.htm', '.htm')).toEqual('home');
            });

            it('will remove the suffix even if the path ends in a slash', function () {
                expect(basename('/some/path_ext.ext/', '.ext')).toEqual('path_ext');
            });
        });
    });

    describe('.formatSeconds(seconds)', function () {
        it('formats negative numbers as an empty time string', function () {
            expect(formatSeconds(-6)).toEqual('0:00');
            expect(formatSeconds(-60)).toEqual('0:00');
            expect(formatSeconds(-3600)).toEqual('0:00');
        });

        it('formats invalid time stamps to a dashed time string', function () {
            expect(formatSeconds(NaN)).toEqual('-:--');
            expect(formatSeconds(Infinity)).toEqual('-:--');
        });

        it('formats seconds', function () {
            expect(formatSeconds(3)).toEqual('0:03');
            expect(formatSeconds(6.114)).toEqual('0:06');
            expect(formatSeconds(9.589)).toEqual('0:10');
        });

        it('formats seconds and minutes', function () {
            expect(formatSeconds(60.114)).toEqual('1:00');
            expect(formatSeconds(69)).toEqual('1:09');
            expect(formatSeconds(113)).toEqual('1:53');
            expect(formatSeconds(618.589)).toEqual('10:19');
        });

        it('formats minutes and hours', function () {
            expect(formatSeconds(3660)).toEqual('1:01:00');
            expect(formatSeconds(7080)).toEqual('1:58:00');
            expect(formatSeconds(3599.589)).toEqual('1:00:00');
            expect(formatSeconds(3900.114)).toEqual('1:05:00');
        });

        it('formats seconds, minutes and hours', function () {
            expect(formatSeconds(3700.114)).toEqual('1:01:40');
            expect(formatSeconds(4263.589)).toEqual('1:11:04');
        });
    });

    describe('.getAttributes(element)', function () {
        it('returns an empty object if the element has no attributes', function () {
            const element = new Element('div');

            expect(getAttributes(element)).toEqual({});
        });

        it('returns an object with the attribute pairs mapped to the object', function () {
            const element = new Element('div.test[data-name=test-element]');

            expect(getAttributes(element)).toEqual({
                'class': 'test',
                'data-name': 'test-element'
            });
        });
    });
});
