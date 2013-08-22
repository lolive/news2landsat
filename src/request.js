var conf = require('./conf.js');
var request = require('request');
var Q = require('q');

exports.sendHttpRequest = function (reqOptions) {

	reqOptions.followAllRedirects = true;
    if(!reqOptions.headers)
	    reqOptions.headers = {};

	if (conf.proxyEnabled) {
        reqOptions.proxy = conf.theProxy;
    }
	
	if (reqOptions.body) {
		try {
			reqOptions.json = JSON.parse(reqOptions.body);
			reqOptions.headers['Content-Type'] = 'text/json';
		} catch (e) {
			//It is not a JSON body
		}
		reqOptions.headers['Content-Length'] = reqOptions.body.length;
	}

	if (reqOptions.uri.indexOf('sitools/datastorage') != -1) {
		reqOptions.headers['Authorization'] = 'Basic ' + new Buffer(conf.logSitools.id + ':' + conf.logSitools.pass).toString('base64');
		reqOptions.headers['Connection'] = 'keep-alive';
	}


	request(reqOptions, function(error, response, body) {
		if (error) {
            reqOptions.error(error);

		} else {
			reqOptions.success(response);
		}
	});

}