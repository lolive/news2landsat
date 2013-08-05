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

	request(reqOptions, function(error, response, body) {
		if (error) {
			whatToDoWithError(error);
		} else {
			whatToDoWithResponse([response.body, postData]);
		}
	});
}