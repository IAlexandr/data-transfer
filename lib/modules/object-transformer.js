var Terraformer = require('terraformer');
var proj4 = require('proj4');

var proj21 = '+proj=tmerc +lat_0=0.0 +lon_0=47.55 +k=1 +x_0=1250105 +y_0=-5814763.504 +ellps=krass +units=m +no_defs';
var projWgs = 'WGS84';

module.exports = function (feature) {
    var terraformerObject = new Terraformer.Primitive(feature);

    var transform = proj4(proj21, projWgs);

    Terraformer.Tools.applyConverter(terraformerObject, transform.forward);

    // var transformedGeoJsonObject = terraformerObject.toJSON();

    return terraformerObject;
};
