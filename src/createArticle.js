var Q = require('q');
var conf = require('./conf.js');
var request = require('./request.js');

exports.createSiToolsArticle = function (article) {
    var qq = Q.defer();
    var createArticle = function createArticle(whatToDoAfterCreation, whatToDoWithCreationError) {
		var dt = new Date();
		var fileName = article.substr(0, article.indexOf('\n')) + "_" + dt.toISOString() + ".html";
        request.sendHttpRequest(whatToDoAfterCreation, whatToDoWithCreationError, "PUT", conf.urlStoreArticle + fileName, article);
    }
    createArticle(qq.resolve, qq.reject);
    return qq.promise;
}