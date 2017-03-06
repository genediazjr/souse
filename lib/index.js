'use strict';


exports.register = (server, options, next) => {

    if (!options.prefix) {

        return next(new Error('Missing prefix'));
    }

    for (const envVars in process.env) {
        if (envVars.indexOf(options.prefix) === 0) {

            let appVar = {};
            try {
                appVar = JSON.parse(process.env[envVars]);
            }
            catch (e) {

                return next(new Error(`Value unparsable: ${process.env[envVars]}`));
            }

            if (appVar.path && appVar.hasOwnProperty('value')) {
                const appVarArr = appVar.path.split('.');
                let tmp = server.app;

                for (let i = 0; i < appVarArr.length; ++i) {
                    if (i === appVarArr.length - 1) {
                        tmp[appVarArr[i]] = appVar.value;
                    }
                    else {
                        tmp[appVarArr[i]] = tmp[appVarArr[i]] || {};
                    }
                    tmp = tmp[appVarArr[i]];
                }
            }
        }
    }

    return next();
};


exports.register.attributes = {
    pkg: require('../package.json')
};
