var Q = require('q');
var conf = require('./conf.js');

function annotateText(geonames, articleText) {
    var qq = Q.defer();
    var annotateLocations = function (whatToDoWithAnnotatedText, whatToDoOnAnnotationError) {
        try {
            var annotatedText = articleText;
            if (geonames) {
                var locations = JSON.parse(geonames);
                if (locations.resolvedLocations) {
                    locations.resolvedLocations.forEach(function (resolvedLocation) {
                        var name = resolvedLocation.inputName;
                        var long = resolvedLocation.geoname.longitude;
                        var lat = resolvedLocation.geoname.latitude;
                        annotatedText = annotateLocation(annotatedText, name, long, lat);
                    });
                }
            }
            return whatToDoWithAnnotatedText(annotatedText);
        } catch (e) {
            whatToDoOnAnnotationError(e);
        }
    };
    annotateLocations(qq.resolve, qq.reject);
    return qq.promise;
}

function annotateLocation(text, name, long, lat) {

    var replacementText = "$1<a href=\"http://localhost/sparql2mapWidget/GoogleEarth/index.xhtml?long=" + long + "&lat=" + lat + "&name=" +encodeURIComponent(name)+ "\">_" + "$2" + "_</a>$3";
    var regexp = new RegExp("([^_]*)" + "("+name+")" + "([^_]*)", "gi");
    if(text)
        return text.replace(regexp, replacementText);

}

exports.annotateText = annotateText
exports.annotateLocation = annotateLocation