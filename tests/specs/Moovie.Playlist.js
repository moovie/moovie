describe('Moovie.Playlist', function () {
    beforeEach(function () {
        this.items = [
            {
                id: 'avatar',
                src: 'avatar.mp4'
            },
            {
                id: 'alice',
                src: 'alice.mp4'
            },
            {
                id: 'shrek',
                src: 'shrek.mp4'
            }
        ];
    });

    it('should be defined', function () {
        expect(Moovie.Playlist).toBeDefined();
    });

    describe('size()', function () {
        it('should have the correct size if playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.size()).toEqual(0);
        });

        it('should have the correct size if there are videos', function () {
            var playlist = new Moovie.Playlist(this.items);

            expect(playlist.size()).toEqual(3);
        });
    });

    describe('current()', function () {
        it('should return nothing if the playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.current()).toBe(null);
        });

        it('should return the first video if there are videos', function () {
            var playlist = new Moovie.Playlist(this.items);

            expect(playlist.current()).toBe(this.items[0]);
        });
    });

    describe('hasPrevious()', function () {
        it('should not have a previous video if playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.hasPrevious()).toBe(false);
        });

        it('should have a previous video if it is not the first video', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(1);
            expect(playlist.hasPrevious()).toBe(true);
        });

        it('should not have a previous video if it is the first video', function () {
            var playlist = new Moovie.Playlist([this.items[1]]);

            expect(playlist.hasPrevious()).toBe(false);
        });
    });

    describe('previous()', function () {
        it('should return nothing if playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.previous()).toBe(null);
        });

        it('should return nothing if the first video is selected', function () {
            var playlist = new Moovie.Playlist(this.items);

            expect(playlist.previous()).toBe(null);
        });

        it('should return the correct video', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(2);
            expect(playlist.previous()).toBe(this.items[1]);
        });
    });

    describe('hasNext()', function () {
        it('should not have another video if playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.hasNext()).toBe(false);
        });

        it('should have another video if it is not the last video', function () {
            var playlist = new Moovie.Playlist(this.items);

            expect(playlist.hasNext()).toBe(true);
        });

        it('should not have another video if it is the last video', function () {
            var playlist = new Moovie.Playlist([this.items[1]]);

            expect(playlist.hasNext()).toBe(false);
        });
    });

    describe('next()', function () {
        it('should return nothing if playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.next()).toBe(null);
        });

        it('should return the correct video', function () {
            var playlist = new Moovie.Playlist(this.items);

            expect(playlist.next()).toBe(this.items[1]);
        });

        it('should return nothing if the last video is selected', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(2);
            expect(playlist.next()).toBe(null);
        });
    });

    describe('select()', function () {
        it('should do nothing if the index is too low', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(-1);
            expect(playlist.current()).toBe(this.items[0]);
        });

        it('should do nothing if the index is too high', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(3);
            expect(playlist.current()).toBe(this.items[0]);
        });

        it('can select a video by its index', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(1);
            expect(playlist.current()).toBe(this.items[1]);
        });
    });
});
