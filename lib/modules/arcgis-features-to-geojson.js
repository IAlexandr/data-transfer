var fs = require('fs');
var FeatureServer = require('arcgis-api-client').FeatureServer;
var terraformerArcgisParser = require('terraformer-arcgis-parser');
var Sphericalmercator = require('sphericalmercator');

// TODO es5 => es6

var prepFeatures = function (props) {
  var fields = props.fields;
  var features = props.features;
  var resultFeatures = [];
  return new Promise(function (resolve, reject) {
    features.forEach(function (feature) {
      var newFeature = {
        type: 'Feature',
        properties: {},
        geometry: {}
      };
      fields.forEach(function (field) {
        newFeature.properties[field['alias']] = feature.attributes[field['name']];
      });
      var gg = terraformerArcgisParser.parse(feature.geometry);
      var sm = new Sphericalmercator();
      switch (gg.type) {
        case 'Point':
          var t = 1;
          gg.coordinates = sm.inverse(gg.coordinates);
          newFeature.geometry = gg;
          break;
        case 'Polygon':
          var coordinates = [];
          gg.coordinates.forEach(function (coords, i) {
            coordinates[i] = [];
            coords.forEach(function (xy) {
              coordinates[i].push(sm.inverse(xy));
            });
          });
          gg.coordinates = coordinates;
          newFeature.geometry = gg;
          break;
        case 'MultiPolygon':
          var coordinates = [];
          gg.coordinates.forEach(function (coords, i) {
            coordinates[i] = [];
            coords.forEach(function (subcoords) {
              var subsoordinates = [];
              subcoords.forEach(function (xy) {
                subsoordinates.push(sm.inverse(xy));
              });
              coordinates[i].push(subsoordinates);
            });
          });
          gg.coordinates = coordinates;
          newFeature.geometry = gg;
          break;
        default:
          throw new Error('FeatureServer geometry type not supported.');
          break;
      }
      resultFeatures.push(newFeature);
    });
    return resolve(resultFeatures);
  });
};

module.exports.writeToFile = function (props, callback) {
  var featureServerUrl = props.featureServerUrl,
    filePath = props.filePath;
  var featureServer = new FeatureServer({ featureServerUrl });
  featureServer.connect()
    .then((fsInfo) => featureServer.query({ returnGeometry: true }))
    .then((result) => prepFeatures(result))
    .then((features) => {
      var featureCollection = {
        type: 'FeatureCollection',
        features: features
      };
      try {
        if (fs.statSync(filePath)) {
          return callback(new Error('Файл с результатом уже существует.'));
        }
      } catch (e) {}

      var ws = fs.createWriteStream(filePath);

      ws.on('finish', () => {
        return callback();
      });
      ws.on('error', (err) => {
        return callback(err);
      });

      ws.write(JSON.stringify(featureCollection, null, 2));
      ws.end();
    })
    .catch(callback);
};
