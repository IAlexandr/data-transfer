import turf from 'turf';
import {valBy} from './utils';

function prepFeaturePointByAnyFeature (feature) {
  switch (feature.geometry.type) {
    case 'Point':
      return feature;
    default:
      return null;
  }
}

export function byDistance ({ featuresFrom, featuresTo, featuresToUniqKey, units = 'kilometers' }, callback) {
  const resultFeatures = {};
  featuresFrom.forEach((featureFrom) => {
    let from = prepFeaturePointByAnyFeature(featureFrom);
    if (!from) {
      return callback(new Error('Geometry type ', featureFrom.geometry.type, 'not' +
        ' supported in filter byDistance. (Source: featureCollectionFrom)'));
    }
    featuresTo.forEach((featureTo) => {
        let to = prepFeaturePointByAnyFeature(featureTo);
        if (!to) {
          return callback(new Error('Geometry type ', featureFrom.geometry.type, 'not ' +
            'supported in filter byDistance.(Source: featureCollectionTo)'));
        }
        const distance = turf.distance(from, to, units);
        if (distance <= 0.1) {
          resultFeatures[valBy(featuresToUniqKey, featureTo)] = featureTo;
        }
      }
    );
  });
  return callback(null, Object.keys(resultFeatures).map((featureKey) => resultFeatures[featureKey]));
}
