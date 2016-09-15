import turf from 'turf';
import {progressConsole} from './utils';

export function getFeaturesByPointsInsidePolygons (fcPoints, fcPolygons) {
  const resultFeatures = [];
  console.log('Поиск точек в полигоне:');
  fcPoints.features.forEach((feature, pointIndex) => {
    let isPointIn = false;
    for (let i = 0; i < fcPolygons.features.length; i++) {
      if (turf.inside(feature, fcPolygons.features[i])) {
        resultFeatures.push(fcPolygons.features[i]);
        progressConsole(resultFeatures.length, 100,
          'Обработано точек: ' + pointIndex + '. Найдено полигонов:');
        isPointIn = true;
        break;
      }
    }
    if (!isPointIn) {
      console.log(feature.properties['Адрес']);
    }
  });
  console.log('Поиск точек в полигоне закончен.', resultFeatures.length);
  return resultFeatures;
}

export function neareOfPolygonBuffer (targetFeatures, sourceFeatures, distance = 1, unit = 'kilometers') {
  const tBuffers = targetFeatures.map((tFeature) => {
    return turf.buffer(tFeature, distance, unit);
  });
  const resultFeatures = [];
  sourceFeatures.forEach((sFeature) => {
    const points = sFeature.geometry.coordinates[0];
    top:
    {
      for (let i = 0; i < points.length; i++) {
        const point = turf.point(points[i]);
        for (let j = 0; j < tBuffers.length; j++) {
          if (turf.inside(point,tBuffers[j])) {

            // TODO указать принадлежность к tFeature по адресу + этажность
            resultFeatures.push(sFeature);
            break top;
          }
        }
      }
    }
  });
  return resultFeatures;
}
