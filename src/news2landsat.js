// Personnal librairies
var boilerPipe = require('./boilerPipe.js');
var clavin = require('./clavin.js');
var annotate = require('./annotate.js');
var articleSI2 = require('./createArticle.js');
var getTreeSI2 = require('./getWebSemanticTree.js');
var updateTreeSI2 = require('./updateWebSemanticTree.js');
var Q = require('q');

function toto() {
    var defer = Q.defer();
    whatToDoWithAnnotatedText(annotate.annotatedText);
    defer.resolve();
    return defer.promise
}

function news2landsat(articleSrc, whatToDoWithAnnotatedText, whatToDoWithError) {
              boilerPipe.callBoilerpipe(/*with url = */"http://linuxfr.org")
    .then(function() {
             clavin.callClavin(/*with text = */boilerPipe.article)
    })
//  .then(function() {
//             annotate.annotateText(/*with geonames = */clavin.geonames, /*and article = */boilerPipe.article)
//  })
//  .then(function() {
//             articleSI2.createSiToolsArticle(/*with article = */annotate.annotatedText)
//  })
//  .then(function() {
//             getTreeSI2.getSiToolsTree(articleSI2.filename)
//  })
//  .then(function() {
//             updateTreeSI2.updateSiToolsTree(articleSI2.filename, getTreeSI2.structure)
//  })
    .then(
                      toto
                  )
    .done();

}
exports.news2landsat = news2landsat;
exports.boilerPipe = boilerPipe;
exports.clavin = clavin;

