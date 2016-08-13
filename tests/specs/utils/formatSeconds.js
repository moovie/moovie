import formatSeconds from '../../../src/js/utils/formatSeconds.js';

// @todo write more desciptive tests
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
