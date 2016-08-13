import basename from '../../../src/js/utils/basename.js';

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
