var qify = require('./qify.js');
var conf = require('./conf.js');
var request = require('./request.js');
var ctx=this;

function callSiToolsForCreation(whatToDoAfterCreation, whatToDoWithCreationError, articleContent) {
    var dt = new Date();
    var fileName = articleContent.substr(0, articleContent.indexOf('\n')) + "_" + dt.toISOString() + ".html";

    var success = function(response){
        ctx.filename = fileName;
        /*then*/ whatToDoAfterCreation(response);};
    var error =  whatToDoWithCreationError;

    request.sendHttpRequest(
        {
            uri: conf.urlStoreArticle + fileName,
            method: "PUT",
            body: articleContent,
            headers: {
                'Content-Type': 'text/html'
            },
            error: error,
            success: success

        }
    );
}

//function createSiToolsArticle(articleContent) {
//    var qq = Q.defer();
//    callSiToolsForCreation(qq.resolve, qq.reject, articleContent);
//    return qq.promise;
//}

exports.createSiToolsArticle = qify.qify(callSiToolsForCreation);
exports.createArticle = callSiToolsForCreation;