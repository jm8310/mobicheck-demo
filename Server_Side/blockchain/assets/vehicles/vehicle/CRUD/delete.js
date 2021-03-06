'use strict';
let request = require('request');
let configFile = require(__dirname+'/../../../../../configurations/configuration.js');
let tracing = require(__dirname+'/../../../../../tools/traces/trace.js');
let map_ID = require(__dirname+'/../../../../../tools/map_ID/map_ID.js');
let Util = require(__dirname+'/../../../../../tools/utils/util');

let user_id;
let securityContext;
let user;

let update = function(req, res, next, usersToSecurityContext)
{
    if(typeof req.cookies.user !== 'undefined')
    {
        req.session.user = req.cookies.user;
        req.session.identity = map_ID.user_to_id(req.cookies.user);
    }

    user_id = req.session.identity;

    let barcode = req.params.barcode;

    tracing.create('ENTER', 'DELETE blockchain/assets/vehicles/vehicle/'+barcode+'/scrap', {});

    res.write('{"message":"Formatting request"}&&');

    let securityContext = usersToSecurityContext[user_id];

    return Util.invokeChaincode(securityContext, 'scrap_vehicle', [ barcode ])
    .then(function(data) {
        tracing.create('INFO', 'DELETE blockchain/assets/vehicles/vehicle/'+barcode+'/scrap', 'Achieving consensus');
        res.write('{"message":"Achieving consensus"}&&');
        let result = {};
        result.message = 'Scrap updated';
        tracing.create('EXIT', 'DELETE blockchain/assets/vehicles/vehicle/'+barcode+'/scrap', result);
        res.end(JSON.stringify(result));
    })
    .catch(function(err) {
        res.status(400);
        tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+barcode+'/scrap', 'Unable to update scrap. barcode: '+ barcode);
        let error = {};
        error.error = true;
        error.message = 'Unable to update scrap. ' + err;
        error.barcode = barcode;
        tracing.create('ERROR', 'DELETE blockchain/assets/vehicles/vehicle/'+barcode+'/scrap', error);
        res.end(JSON.stringify(error));
    });
};
exports.delete = update;
