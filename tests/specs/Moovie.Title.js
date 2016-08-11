describe('Moovie.Title', function () {
    it('should be defined', function () {
        expect(Moovie.Title).toBeDefined();
    });

    it('can be treated as an element', function () {
        var title = new Moovie.Title();

        expect(typeOf(document.id(title))).toEqual('element');
    });

    describe('initialize()', function () {
        it('builds the correct tag', function () {
            var title = new Moovie.Title();

            expect(document.id(title).get('tag')).toEqual('div');
        });

        it('has the correct CSS class name', function () {
            var title = new Moovie.Title();

            expect(document.id(title).hasClass('moovie-title')).toBe(true);
        });

        it('can be provided with default HTML content', function () {
            var title = new Moovie.Title({ content: '<h1>Moovie</h1>' });
            var expectedElement = document.id(title).getElement('h1');

            expect(document.id(title).contains(expectedElement)).toBe(true);
        });

        it('can be provided with default text content', function () {
            var title = new Moovie.Title({ content: 'moovie' });

            expect(document.id(title).get('text')).toEqual('moovie');
        });

        it('defaults to a hidden state in the class', function () {
            var title = new Moovie.Title();

            expect(title.isHidden()).toBe(true);
        });

        it('defaults to a hidden state on the element', function () {
            var title = new Moovie.Title();

            expect(document.id(title).get('aria-hidden')).toBe('true');
        });

        it('can be changed to a visible state by default in the class', function () {
            var title = new Moovie.Title({ hidden: false });

            expect(title.isHidden()).toBe(false);
        });

        it('can be changed to a visible state by default on the element', function () {
            var title = new Moovie.Title({ hidden: false });

            expect(document.id(title).get('aria-hidden')).toBe('false');
        });
    });

    describe('build()', function () {
        it('can be chained', function () {
            var title = new Moovie.Title();

            expect(title.build()).toBe(title);
        });
    });

    describe('update()', function () {
        it('can be updated with HTML content', function () {
            var title = new Moovie.Title({ content: '<h1>Moovie</h1>' });
            var expectedElement = document.id(title).getElement('h1');

            expect(document.id(title).contains(expectedElement)).toBe(true);
        });

        it('can be updated with text content', function () {
            var title = new Moovie.Title({ content: 'moovie' });

            expect(document.id(title).get('text')).toEqual('moovie');
        });

        it('can be chained', function () {
            var title = new Moovie.Title();

            expect(title.update('moovie')).toBe(title);
        });
    });

    describe('show()', function () {
        it('updates the state in the class', function () {
            var title = new Moovie.Title();

            title.show();

            expect(title.isHidden()).toBe(false);
        });

        it('updates the state on the element', function () {
            var title = new Moovie.Title();

            title.show();

            expect(document.id(title).get('aria-hidden')).toBe('false');
        });

        it('fires an event', function () {
            var title = new Moovie.Title();
            var spy = sinon.spy();

            title.addEvent('show', spy);
            title.show();

            expect(spy.called).toBe(true);
        });

        it('should autohide after a period of time', function (done) {
            var title = new Moovie.Title({ delay: 500 });

            title.addEvent('hide', function () {
                done();
            });

            title.show();
        });

        it('should not autohide if option is turned off', function () {
            var title = new Moovie.Title({ autohide: false });
            var spy = sinon.spy();

            title.addEvent('hide', spy);
            title.show();

            expect(spy.called).toBe(false);
        });

        it('can be chained', function () {
            var title = new Moovie.Title();

            expect(title.show()).toBe(title);
        });
    });

    describe('hide()', function () {
        it('updates the state in the class', function () {
            var title = new Moovie.Title({ hidden: false });

            title.hide();

            expect(title.isHidden()).toBe(true);
        });

        it('updates the state on the element', function () {
            var title = new Moovie.Title({ hidden: false });

            title.hide();

            expect(document.id(title).get('aria-hidden')).toBe('true');
        });

        it('fires an event', function () {
            var title = new Moovie.Title({ hidden: false });
            var spy = sinon.spy();

            title.addEvent('hide', spy);
            title.hide();

            expect(spy.called).toBe(true);
        });

        it('can be chained', function () {
            var title = new Moovie.Title();

            expect(title.hide()).toBe(title);
        });
    });
});
