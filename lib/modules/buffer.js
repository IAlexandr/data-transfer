import turf from 'turf';
import featurecollection from 'turf-featurecollection';
import {coordEach} from 'turf-meta';
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
  const tBuffersFeatures = targetFeatures.map((tFeature, i) => {
    const buf = turf.buffer(tFeature, distance, unit);
    tFeature.geometry = buf.geometry;
    return tFeature;
  });
  const resultFeatures = [];
  sourceFeatures.forEach((sFeature, sFeatureIndex) => {
    const points = sFeature.geometry.coordinates[0];
    top:
    {
      for (let i = 0; i < points.length; i++) {
        const point = turf.point(points[i]);
        for (let j = 0; j < tBuffersFeatures.length; j++) {
          if (turf.inside(point, tBuffersFeatures[j])) {
            if (sFeature.properties['Название_улицы'] || sFeature.properties['RegisterNo']) {

            } else {
              sFeature.properties['этажность'] = sFeature.properties['этажность'] || 1;
              sFeature.properties['RegisterNo'] = sFeature.properties['RegisterNo'] || tBuffersFeatures[j].properties['RegisterNo'];
              sFeature.properties['ParentRegisterNo'] = tBuffersFeatures[j].properties['RegisterNo'];
            }
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

let result2 = {};
export function neareOfPolygonBuf (targetFeature, sourceFeatures, result = {}, distance = 1, unit = 'kilometers') {
  const buf = turf.buffer(targetFeature, distance, unit);
  sourceFeatures.forEach((sFeature, sFeatureIndex) => {
    if (sFeature.properties.ID !== targetFeature.properties.ID && !result2.hasOwnProperty(sFeature.properties.ID)) {
      // progressConsole(sFeatureIndex, 10,
      //   'sourceFeatures обработано: ');
      const points = sFeature.geometry.coordinates[0];
      //top:
      {
        for (let i = 0; i < points.length; i++) {
          const point = turf.point(points[i]);
          if (turf.inside(point, buf)) {
            if (sFeature.properties['Название_улицы']) {
              sFeature.properties['ParentRegisterNo'] = targetFeature.properties['ParentRegisterNo'] || targetFeature.properties['RegisterNo'];
            } else {
              sFeature.properties['этажность'] = sFeature.properties['этажность'] || 1;
              // sFeature.properties['RegisterNo'] = sFeature.properties['RegisterNo'] ||
              // targetFeature.properties['RegisterNo'];
              sFeature.properties['ParentRegisterNo'] = targetFeature.properties['RegisterNo'];
            }
            result2[sFeature.properties.ID] = sFeature;
            neareOfPolygonBuf(sFeature, sourceFeatures, result, distance, unit);
            // progressConsole(Object.keys(result).length, 1,
            //   'sourceFeatures обработано: ' + sFeatureIndex + '. Найдено прилегающих полигонов:');
            // result2 = Object.assign(result2, neareOfPolygonBuf(sFeature, sourceFeatures, result, distance, unit));
            // break top;
          }
        }
      }
    }
  });
  // return result;
}

function myextent (layer) {
  var extent = [Infinity, Infinity, -Infinity, -Infinity];
  coordEach(layer, function (coord) {
    if (extent[0] > coord[0]) extent[0] = coord[0];
    if (extent[1] > coord[1]) extent[1] = coord[1];
    if (extent[2] < coord[0]) extent[2] = coord[0];
    if (extent[3] < coord[1]) extent[3] = coord[1];
  });
  return extent;
}

export function findBuildingsByPolygons (targetFeatures, sourceFeatures, distance = 1, unit = 'kilometers') {
  const sourceFeatureByID = {};
  const sourceFeaturesFirstPoints = [];
  console.log('Начинаем поиск прилегающих геометрий к полигонам. Кол-во полигонов в которых ведется поиск (', sourceFeatures.length, ')');
  sourceFeatures.forEach((sFeature) => {
    sourceFeatureByID[sFeature.properties['ID']] = sFeature;
    const point = turf.point(sFeature.geometry.coordinates[0][0]);
    point.properties.ID = sFeature.properties['ID'];
    sourceFeaturesFirstPoints.push(point);
  });
  const source_points_fc = featurecollection(sourceFeaturesFirstPoints);
  const resultFeatures = [];

  targetFeatures.forEach((tFeature, i) => {
    // if (i < 10) {
      // const center = turf.center(tFeature);
      const buf = turf.buffer(tFeature, distance, unit);
      const bufFc = featurecollection([buf]);
      const extent = myextent(bufFc);
      const bbox = turf.bboxPolygon(extent);
      const bboxFc = featurecollection([bbox]);
      const sourceFeaturesInExtentFc = turf.within(source_points_fc, bboxFc);
      const sourceFeaturesForFilter = sourceFeaturesInExtentFc.features.map((feature) => {
        return sourceFeatureByID[feature.properties.ID];
      });
      if (tFeature.properties.RegisterNo === '00010003D30E') {
        const t = 1;
      }
      neareOfPolygonBuf(tFeature,
        sourceFeaturesForFilter,
        {},
        0.000001,
        unit = 'kilometers');


      progressConsole(i, 5,
        'Обработано целевых полигонов:'); //'resultFeatures найдено: ' + resultFeatures.length +
    // }
  });
  Object.keys(result2).forEach((featureId) => {
    resultFeatures.push(result2[featureId]);
  });
  console.log('Найдено пристроев:', resultFeatures.length);
  return resultFeatures;
}