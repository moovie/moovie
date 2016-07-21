describe('Moovie.Debugger', function () {
    it('should be defined', function () {
        expect(Moovie.Debugger).toBeDefined();
    });

    it('should be a class', function () {
        expect(typeOf(Moovie.Debugger)).toEqual('class');
    });
});
