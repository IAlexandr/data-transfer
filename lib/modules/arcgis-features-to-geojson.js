import {FeatureServer} from 'arcgis-api-client';
import terraformerArcgisParser from 'terraformer-arcgis-parser';
import Sphericalmercator from 'sphericalmercator';
const sm = new Sphericalmercator();

function prepCoordsWithConvert (coordSystemConvertOperation, coords) {
  if (!coordSystemConvertOperation) {
    return coords;
  }
  return sm[coordSystemConvertOperation](coords);
}

function prepFeatures ({fields, features, coordSystemConvertOperation}) {
  const resultFeatures = [];
  return new Promise((resolve, reject) => {
    features.forEach((feature) => {
      const newFeature = {
        type: 'Feature',
        properties: {},
        geometry: {}
      };
      fields.forEach((field) => {
        newFeature.properties[field['alias']] = feature.attributes[field['name']];
      });
      const gg = terraformerArcgisParser.parse(feature.geometry);

      const coordinates = [];
      switch (gg.type) {
        case 'Point':
          gg.coordinates = prepCoordsWithConvert(coordSystemConvertOperation, gg.coordinates);
          newFeature.geometry = gg;
          break;
        case 'Polygon':
          gg.coordinates.forEach((coords, i) => {
            coordinates[i] = [];
            coords.forEach((xy) => {
              coordinates[i].push(prepCoordsWithConvert(coordSystemConvertOperation, xy));
            });
          });
          gg.coordinates = coordinates;
          newFeature.geometry = gg;
          break;
        case 'MultiPolygon':
          gg.coordinates.forEach((coords, i) => {
            coordinates[i] = [];
            coords.forEach((subcoords) => {
              const subsoordinates = [];
              subcoords.forEach(function (xy) {
                subsoordinates.push(prepCoordsWithConvert(coordSystemConvertOperation, xy));
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

export default function (props, callback) {
  const { featureServerUrl, coordSystemConvertOperation, username, password } = props;
  const featureServer = new FeatureServer({ featureServerUrl, username, password });
  featureServer.connect()
    .then((fsInfo) => featureServer.query({ returnGeometry: true }))
    .then((result) => prepFeatures(Object.assign(result, { coordSystemConvertOperation })))
    .then((features) => {
      return callback (null, {
        type: 'FeatureCollection',
        features: features
      });
    })
    .catch(callback);
};
