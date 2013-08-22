var qify = require('./qify.js');
var conf = require('./conf.js');
var ctx = this;


function annotateLocations(geonames, articleText) {
    var defer = Q.defer();
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
        ctx.annotatedText = annotatedText;
        defer.resolve(annotatedText);
    } catch (e) {
        defer.reject(e);
    }
    return defer.promise;
};

//function annotateText(geonames, articleText) {
//    var qq = Q.defer();
//    annotateLocations(qq.resolve, qq.reject, geonames, articleText);
//    return qq.promise;
//}

function annotateLocation(text, name, long, lat) {
    var replacementText = "$1<a href=\""+conf.sparql2mapWidgetUrl+"?long=" + long + "&lat=" + lat + "&name=" +encodeURIComponent(name)+ "\">_" + "$2" + "_</a>$3";
    var regexp = new RegExp("([^_]*)" + "("+name+")" + "([^_]*)", "gi");
    if(text)
        return text.replace(regexp, replacementText);

}

//exports.annotateText = qify.qify(annotateLocations);
exports.annotateLocation = annotateLocation;
exports.annotateLocations = annotateLocations;