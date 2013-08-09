var conf = require('./conf.js');
var request = require('request');

exports.sendHttpRequest = function (whatToDoWithResponse, whatToDoWithError, theMethod, theUrl, postData) {

	var reqOptions = {};
	reqOptions.uri = theUrl;
	reqOptions.method = theMethod;
	reqOptions.followAllRedirects = true;
	reqOptions.headers = {};

	if (conf.proxyEnabled) {
        reqOptions.proxy = conf.theProxy;
    }
	
	if (postData) {
		try {
			reqOptions.json = JSON.parse(postData);
			reqOptions.headers['Content-Type'] = 'text/json';
		} catch (e) {
			reqOptions.body = postData;
		}
		reqOptions.headers['Content-Length'] = postData.length;
	}
	
	if (theUrl.indexOf('sitools/datastorage') != -1) {
		reqOptions.headers['Authorization'] = 'Basic ' + new Buffer(conf.logSitools.id + ':' + conf.logSitools.pass).toString('base64');
		reqOptions.headers['Connection'] = 'keep-alive';
	}

	request(reqOptions, function(error, response, body) {
		if (error) {
			whatToDoWithError(error);
		} else {
			whatToDoWithResponse([response.body, postData]);
		}
	});
}