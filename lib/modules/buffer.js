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
  console.log('Начинаем поиск прилегающих геометрий к полигонам. Кол-во полигонов в которых ведется поиск (', sourceFeatures.length, ')');
  const tBuffersFeatures = targetFeatures.map((tFeature) => {
    const buf = turf.buffer(tFeature, distance, unit);
    tFeature.geometry = buf.geometry;
    return tFeature;
  });
  const resultFeatures = [];
  sourceFeatures.forEach((sFeature, sFeatureIndex) => {
    progressConsole(sFeatureIndex, 10,
      'sourceFeatures обработано: ');
    const points = sFeature.geometry.coordinates[0];
    top:
    {
      for (let i = 0; i < points.length; i++) {
        const point = turf.point(points[i]);
        for (let j = 0; j < tBuffersFeatures.length; j++) {
          if (turf.inside(point,tBuffersFeatures[j])) {
            if (sFeature.properties['Название_улицы'] || sFeature.properties['RegisterNo']) {

            } else {
              sFeature.properties['этажность'] = sFeature.properties['этажность'] || 1;
              sFeature.properties['RegisterNo'] = sFeature.properties['RegisterNo'] || tBuffersFeatures[j].properties['RegisterNo'];
              sFeature.properties['ParentRegisterNo'] = tBuffersFeatures[j].properties['RegisterNo'];
            }
            // TODO указать принадлежность к tFeature по адресу + этажность
            resultFeatures.push(sFeature);
            progressConsole(resultFeatures.length, 1,
              'sourceFeatures обработано: ' + sFeatureIndex + '. Найдено прилегающих полигонов:');
            break top;
          }
        }
      }
    }
  });
  return resultFeatures;
}
