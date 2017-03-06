# souse
[![Build Status](https://travis-ci.org/genediazjr/souse.svg?branch=master)](https://travis-ci.org/genediazjr/souse)
[![Coverage Status](https://coveralls.io/repos/github/genediazjr/souse/badge.svg?branch=master)](https://coveralls.io/github/genediazjr/souse?branch=master)
[![Code Climate](https://codeclimate.com/github/genediazjr/souse/badges/gpa.svg)](https://codeclimate.com/github/genediazjr/souse)
[![NPM Version](https://badge.fury.io/js/souse.svg)](https://www.npmjs.com/souse)
[![NPM Downloads](https://img.shields.io/npm/dt/souse.svg?maxAge=2592000)](https://www.npmjs.com/souse)<br>
[![Dependency Status](https://david-dm.org/genediazjr/souse.svg)](https://david-dm.org/genediazjr/souse)
[![Known Vulnerabilities](https://snyk.io/test/github/genediazjr/souse/badge.svg)](https://snyk.io/test/github/genediazjr/souse)
[![NSP Status](https://nodesecurity.io/orgs/genediazjr/projects/01913938-ccb8-4ede-8244-696d1b3ee4a7/badge)](https://nodesecurity.io/orgs/genediazjr/projects/01913938-ccb8-4ede-8244-696d1b3ee4a7)

A hapi plugin that injects environment variables into hapi's `server.app`.<br>
The environment variables to be injected is expected to have a common name `prefix`<br>
and their values must contain a stringified object containing a `path` and a `value` key.
```
FOO_VAR_test='{"path":"some.config.stuff","value":"Bazinga!"}' node app.js
```

## Usage

```js
server.register({
    register: require('souse'),
    options: {
        prefix: 'FOO_VAR_'
    }
}, (err) => {
    ...
});
```
[Glue](https://github.com/hapijs/glue) manifest
```js
registrations: [
    {
        plugin: {
            register: 'souse',
            options: {
                ...
            }
        }
    }
]
```
The order in which the plugin is called is important. 
The plugin will **overwrite** previous values of a key.

## Contributing
* Include 100% test coverage
* Follow the [Hapi coding conventions](http://hapijs.com/styleguide)
* Submit an issue first for significant changes.
