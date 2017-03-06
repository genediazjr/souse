'use strict';

const Rewire = require('rewire');
const Hapi = require('hapi');
const Code = require('code');
const Lab = require('lab');
const Plugin = Rewire('../');

const expect = Code.expect;
const lab = exports.lab = Lab.script();
const beforeEach = lab.beforeEach;
const describe = lab.describe;
const it = lab.it;


describe('registration and functionality', () => {

    let server;

    beforeEach((done) => {

        server = new Hapi.Server();

        return done();
    });

    const register = (options, next) => {

        server.register({
            register: Plugin,
            options: options
        }, (err) => {

            return next(err);
        });
    };

    it('registers', (done) => {

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.not.exist();

            return done();
        });
    });

    it('returns error if no option', (done) => {

        register({}, (err) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Missing prefix');

            return done();
        });
    });

    it('adds new server.app value', (done) => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}'
            }
        });

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });

            return done();
        });
    });


    it('adds only matching prefix', (done) => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                SOME_VAR_test: 'nothingness'
            }
        });

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });

            return done();
        });
    });

    it('returns error on unparsable value', (done) => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                FOO_VAR_test2: 'not a stringified object'
            }
        });

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.exist();
            expect(err.message).to.equal('Value unparsable: not a stringified object');

            return done();
        });
    });

    it('ignores if no value key', (done) => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                FOO_VAR_test2: '{"path":"some","key": "test"}'
            }
        });

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });

            return done();
        });
    });

    it('ignores if no path key', (done) => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                FOO_VAR_test2: '{"value":"some","key": "test"}'
            }
        });

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });

            return done();
        });
    });

    it('reuses existing objects in the path', (done) => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}'
            }
        });

        server.app.some = {};

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });

            return done();
        });
    });

    it('overwrites existing value', (done) => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}'
            }
        });

        server.app.some = { config: { stuff: 'Spock!' } };
        expect(server.app).to.equal({ some: { config: { stuff: 'Spock!' } } });

        register({
            prefix: 'FOO_VAR_'
        }, (err) => {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });

            return done();
        });
    });
});
