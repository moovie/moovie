import expect from 'expectations';
import sinon from 'sinon';
import Title from '../../src/js/Title.js';

describe('Title', function () {
    it('can be treated as an element', function () {
        const title = new Title();

        expect(typeOf(document.id(title))).toEqual('element');
    });

    describe('#initialize()', function () {
        it('builds the correct tag', function () {
            const title = new Title();

            expect(document.id(title).get('tag')).toEqual('div');
        });

        it('has the correct CSS class name', function () {
            const title = new Title();

            expect(document.id(title).hasClass('moovie-title')).toBe(true);
        });

        it('can be provided with default HTML content', function () {
            const title = new Title({ content: '<h1>Moovie</h1>' });
            const expectedElement = document.id(title).getElement('h1');

            expect(document.id(title).contains(expectedElement)).toBe(true);
        });

        it('can be provided with default text content', function () {
            const title = new Title({ content: 'moovie' });

            expect(document.id(title).get('text')).toEqual('moovie');
        });

        it('defaults to a hidden state in the class', function () {
            const title = new Title();

            expect(title.isHidden()).toBe(true);
        });

        it('defaults to a hidden state on the element', function () {
            const title = new Title();

            expect(document.id(title).get('aria-hidden')).toBe('true');
        });

        it('can be changed to a visible state by default in the class', function () {
            const title = new Title({ hidden: false });

            expect(title.isHidden()).toBe(false);
        });

        it('can be changed to a visible state by default on the element', function () {
            const title = new Title({ hidden: false });

            expect(document.id(title).get('aria-hidden')).toBe('false');
        });
    });

    describe('#build()', function () {
        it('can be chained', function () {
            const title = new Title();

            expect(title.build()).toBe(title);
        });
    });

    describe('#update()', function () {
        it('can be updated with HTML content', function () {
            const title = new Title({ content: '<h1>Moovie</h1>' });
            const expectedElement = document.id(title).getElement('h1');

            expect(document.id(title).contains(expectedElement)).toBe(true);
        });

        it('can be updated with text content', function () {
            const title = new Title({ content: 'moovie' });

            expect(document.id(title).get('text')).toEqual('moovie');
        });

        it('can be chained', function () {
            const title = new Title();

            expect(title.update('moovie')).toBe(title);
        });
    });

    describe('#show()', function () {
        it('updates the state in the class', function () {
            const title = new Title();

            title.show();

            expect(title.isHidden()).toBe(false);
        });

        it('updates the state on the element', function () {
            const title = new Title();

            title.show();

            expect(document.id(title).get('aria-hidden')).toBe('false');
        });

        it('fires an event', function () {
            const title = new Title();
            const spy = sinon.spy();

            title.addEvent('show', spy);
            title.show();

            expect(spy.called).toBe(true);
        });

        it('should autohide after a period of time', function (done) {
            const title = new Title({ delay: 500 });

            title.addEvent('hide', function () {
                done();
            });

            title.show();
        });

        it('should not autohide if option is turned off', function () {
            const title = new Title({ autohide: false });
            const spy = sinon.spy();

            title.addEvent('hide', spy);
            title.show();

            expect(spy.called).toBe(false);
        });

        it('can be chained', function () {
            const title = new Title();

            expect(title.show()).toBe(title);
        });
    });

    describe('#hide()', function () {
        it('updates the state in the class', function () {
            const title = new Title({ hidden: false });

            title.hide();

            expect(title.isHidden()).toBe(true);
        });

        it('updates the state on the element', function () {
            const title = new Title({ hidden: false });

            title.hide();

            expect(document.id(title).get('aria-hidden')).toBe('true');
        });

        it('fires an event', function () {
            const title = new Title({ hidden: false });
            const spy = sinon.spy();

            title.addEvent('hide', spy);
            title.hide();

            expect(spy.called).toBe(true);
        });

        it('can be chained', function () {
            const title = new Title();

            expect(title.hide()).toBe(title);
        });
    });
});
