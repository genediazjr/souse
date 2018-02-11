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

    beforeEach(() => {

        server = Hapi.server();
    });

    const register = async (options) => {

        await server.register({
            plugin: Plugin,
            options: options
        });
    };

    it('registers', async () => {

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (err) {

            expect(err).to.not.exist();
        }
    });

    it('returns error if no option', async () => {

        let err;

        try {

            await register({});
        }
        catch (ex) {

            err = ex;
        }

        expect(err).to.exist();
        expect(err.message).to.equal('Missing prefix');
    });

    it('adds new server.app value', async () => {

        Plugin.__set__('process', {
            env: { FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}' }
        });

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (err) {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });
        }
    });

    it('adds only matching prefix', async () => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                SOME_VAR_test: 'nothingness'
            }
        });

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (err) {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });
        }
    });

    it('returns error on unparsable value', async () => {

        let err;

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                FOO_VAR_test2: 'not a stringified object'
            }
        });

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (ex) {

            err = ex;
        }

        expect(err).to.exist();
        expect(err.message).to.equal('Value unparsable: not a stringified object');
    });

    it('ignores if no value key', async () => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                FOO_VAR_test2: '{"path":"some","key": "test"}'
            }
        });

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (err) {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });
        }
    });

    it('ignores if no path key', async () => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}',
                FOO_VAR_test2: '{"value":"some","key": "test"}'
            }
        });

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (err) {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });
        }
    });

    it('reuses existing objects in the path', async () => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}'
            }
        });

        server.app.some = {};

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (err) {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });
        }
    });

    it('overwrites existing value', async () => {

        Plugin.__set__('process', {
            env: {
                FOO_VAR_test1: '{"path":"some.config.stuff","value":"Bazinga!"}'
            }
        });

        server.app.some = { config: { stuff: 'Spock!' } };
        expect(server.app).to.equal({ some: { config: { stuff: 'Spock!' } } });

        try {

            await register({ prefix: 'FOO_VAR_' });
        }
        catch (err) {

            expect(err).to.not.exist();
            expect(server.app).to.equal({ some: { config: { stuff: 'Bazinga!' } } });
        }
    });
});
