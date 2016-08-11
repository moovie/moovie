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

    describe('initialize()', function () {
        it('should be hidden', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.isHidden()).toBe(true);
        });
    });

    describe('show()', function () {
        it('should not be hidden', function () {
            var playlist = new Moovie.Playlist();

            playlist.show();

            expect(playlist.isHidden()).toBe(false);
        });

        it('should fire an event', function () {
            var playlist = new Moovie.Playlist();
            var spy = sinon.spy();

            playlist.addEvent('show', spy);
            playlist.show();

            expect(spy.called).toBe(true);
        });

        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.previous()).toBe(playlist);
        });
    });

    describe('hide()', function () {
        it('should be hidden', function () {
            var playlist = new Moovie.Playlist();

            playlist.hide();

            expect(playlist.isHidden()).toBe(true);
        });

        it('should fire an event', function () {
            var playlist = new Moovie.Playlist();
            var spy = sinon.spy();

            playlist.addEvent('hide', spy);
            playlist.hide();

            expect(spy.called).toBe(true);
        });

        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.previous()).toBe(playlist);
        });
    });

    describe('size()', function () {
        it('should return zero if the playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.size()).toBe(0);
        });

        it('should return one if the playlist has only one item', function () {
            var playlist = new Moovie.Playlist([this.items[0]]);

            expect(playlist.size()).toBe(1);
        });

        it('should return the correct size if the playlist contains multiple items', function () {
            var playlist = new Moovie.Playlist(this.items);

            expect(playlist.size()).toBe(3);
        });
    });

    describe('current()', function () {
        it('should return nothing if the playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.current()).toBe(null);
        });

        it('should return that item if the playlist only has one item', function () {
            var playlist = new Moovie.Playlist([this.items[0]]);

            expect(playlist.current()).toBe(this.items[0]);
        });

        it('should return the first item if the playlist has multiple items', function () {
            var playlist = new Moovie.Playlist(this.items);

            expect(playlist.current()).toBe(this.items[0]);
        });
    });

    describe('hasPrevious()', function () {
        it('should return false if the playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.hasPrevious()).toBe(false);
        });

        it('should return false if the playlist contains only one item', function () {
            var playlist = new Moovie.Playlist([this.items[0]]);

            expect(playlist.hasPrevious()).toBe(false);
        });

        context('if the playlist contains multiple items', function () {
            it('will return false if the first item is selected', function () {
                var playlist = new Moovie.Playlist(this.items);

                playlist.select(0);

                expect(playlist.hasPrevious()).toBe(false);
            });

            it('will return true if the first item is not selected', function () {
                var playlist = new Moovie.Playlist(this.items);

                playlist.select(1);

                expect(playlist.hasPrevious()).toBe(true);
            });
        });
    });

    // Tests should not really have more than one expectaion, but here it is
    // neccessary. This simplifies our tests significantly.
    describe('previous()', function () {
        it('should decline to the previous item until the first item is reached', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(2);

            playlist.previous();
            expect(playlist.current()).toBe(this.items[1]);

            playlist.previous();
            expect(playlist.current()).toBe(this.items[0]);

            playlist.previous();
            expect(playlist.current()).toBe(this.items[0]);
        });

        it('should fire an event every time the playlist actually declines', function () {
            var playlist = new Moovie.Playlist(this.items);
            var spy = sinon.spy();

            playlist.select(2);
            playlist.addEvent('select', spy);

            playlist.previous();
            expect(spy.getCall(0).calledWith(this.items[1])).toBe(true);

            playlist.previous();
            expect(spy.getCall(1).calledWith(this.items[0])).toBe(true);

            playlist.previous();
            expect(spy.callCount).toBe(2);
        });

        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.previous()).toBe(playlist);
        });
    });

    describe('hasNext()', function () {
        it('should return false if the playlist is empty', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.hasNext()).toBe(false);
        });

        it('should return false if the playlist contains only one item', function () {
            var playlist = new Moovie.Playlist([this.items[0]]);

            expect(playlist.hasNext()).toBe(false);
        });

        context('if the playlist contains multiple items', function () {
            it('will return false if the last item is selected', function () {
                var playlist = new Moovie.Playlist(this.items);

                playlist.select(2);

                expect(playlist.hasNext()).toBe(false);
            });

            it('will return true if the last item is not selected', function () {
                var playlist = new Moovie.Playlist(this.items);

                playlist.select(1);

                expect(playlist.hasNext()).toBe(true);
            });
        });
    });

    // Tests should not really have more than one expectaion, but here it is
    // neccessary. This simplifies our tests significantly.
    describe('next()', function () {
        it('should advance to the next item until the last item is reached', function () {
            var playlist = new Moovie.Playlist(this.items);

            playlist.select(0);

            playlist.next();
            expect(playlist.current()).toBe(this.items[1]);

            playlist.next();
            expect(playlist.current()).toBe(this.items[2]);

            playlist.next();
            expect(playlist.current()).toBe(this.items[2]);
        });

        it('should fire an event every time the playlist actually advances', function () {
            var playlist = new Moovie.Playlist(this.items);
            var spy = sinon.spy();

            playlist.select(0);
            playlist.addEvent('select', spy);

            playlist.next();
            expect(spy.getCall(0).calledWith(this.items[1])).toBe(true);

            playlist.next();
            expect(spy.getCall(1).calledWith(this.items[2])).toBe(true);

            playlist.next();
            expect(spy.callCount).toBe(2);
        });

        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.next()).toBe(playlist);
        });
    });

    describe('select()', function () {
        it('should be chainable', function () {
            var playlist = new Moovie.Playlist();

            expect(playlist.select(0)).toBe(playlist);
        });

        context('an empty playlist', function () {
            it('does not change the current item when attempting to select an item', function () {
                var playlist = new Moovie.Playlist();

                playlist.select(0);

                expect(playlist.current()).toBe(null);
            });

            it('does not fire an event when attempting to select an item', function () {
                var playlist = new Moovie.Playlist();
                var spy = sinon.spy();

                playlist.addEvent('select', spy);
                playlist.select(0);

                expect(spy.called).toBe(false);
            });
        });

        context('a playlist consisting of only one item', function () {
            it('always returns the same item regardless of the value', function () {
                var playlist = new Moovie.Playlist([this.items[0]]);
                var current = playlist.current();

                playlist.select(-1);
                expect(playlist.current()).toBe(current);

                playlist.select(0);
                expect(playlist.current()).toBe(current);

                playlist.select(3);
                expect(playlist.current()).toBe(current);
            });

            it('never fires an event unless the value is zero', function () {
                var playlist = new Moovie.Playlist([this.items[0]]);
                var spy = sinon.spy();

                playlist.addEvent('select', spy);
                playlist.select(-1);
                playlist.select(0);
                playlist.select(3);

                expect(spy.callCount).toBe(1);
                expect(spy.calledWith(this.items[0])).toBe(true);
            });
        });

        context('a playlist consisting of multiple items', function () {
            it('does not change the current item if the value is negative', function () {
                var playlist = new Moovie.Playlist(this.items);
                var current = playlist.current();

                playlist.select(-1);

                expect(playlist.current()).toBe(current);
            });

            it('does not change the current item if the value is equal to the playlist size', function () {
                var playlist = new Moovie.Playlist(this.items);
                var current = playlist.current();

                playlist.select(playlist.size());

                expect(playlist.current()).toBe(current);
            });

            it('does not change the current item if the value is greater than the playlist size', function () {
                var playlist = new Moovie.Playlist(this.items);
                var current = playlist.current();

                playlist.select(playlist.size() + 1);

                expect(playlist.current()).toBe(current);
            });

            it('does not fire an event if the value is negative', function () {
                var playlist = new Moovie.Playlist(this.items);
                var spy = sinon.spy();

                playlist.addEvent('select', spy);
                playlist.select(-1);

                expect(spy.called).toBe(false);
            });

            it('does not fire an event if the value is equal to the playlist size', function () {
                var playlist = new Moovie.Playlist(this.items);
                var spy = sinon.spy();

                playlist.addEvent('select', spy);
                playlist.select(playlist.size());

                expect(spy.called).toBe(false);
            });

            it('does not fire an event if the value is greater than the playlist size', function () {
                var playlist = new Moovie.Playlist(this.items);
                var spy = sinon.spy();

                playlist.addEvent('select', spy);
                playlist.select(playlist.size() + 1);

                expect(spy.called).toBe(false);
            });

            it('will change the current item if the value is valid', function () {
                var playlist = new Moovie.Playlist(this.items);

                playlist.select(1);

                expect(playlist.current()).toBe(this.items[1]);
            });

            it('will fire an event if the value is valid', function () {
                var playlist = new Moovie.Playlist(this.items);
                var spy = sinon.spy();

                playlist.addEvent('select', spy);
                playlist.select(1);

                expect(spy.calledWith(this.items[1])).toBe(true);
            });
        });
    });
});
