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

    // @todo write proper desciptive tests
    describe('.formatSeconds(seconds)', function () {
        it('should handle seconds below 10', function () {
            expect(formatSeconds(9)).toEqual('0:09');
        });

        it('should handle seconds above 10 and below 1 minute', function () {
            expect(formatSeconds(23)).toEqual('0:23');
        });

        it('should handle seconds equal to exactly 1 minute', function () {
            expect(formatSeconds(60)).toEqual('1:00');
        });

        it('should handle seconds over 1 minute and less than 10 seconds', function () {
            expect(formatSeconds(63)).toEqual('1:03');
        });

        it('should handle seconds over 1 minute and over 10 seconds', function () {
            expect(formatSeconds(71)).toEqual('1:11');
        });

        it('should handle seconds over 10 minutes', function () {
            expect(formatSeconds(600)).toEqual('10:00');
        });

        it('should handle seconds equal to exactly 60 minutes', function () {
            expect(formatSeconds(3600)).toEqual('1:00:00');
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
