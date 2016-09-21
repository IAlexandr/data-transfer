import path from 'path';
import arcgisFeaturesToGeojson from './lib/modules/arcgis-features-to-geojson';
import jsonToNedb from './lib/modules/json-to-nedb';
import {byDistance as filterByDistance} from './lib/modules/filtering';
import {getFeaturesByPointsInsidePolygons, neareOfPolygonBuffer, findBuildingsByPolygons} from './lib/modules/buffer';
import {writeToFile} from './lib/modules/utils';
import connections from './connections.js';
import turfArea from 'turf-area';

/*

 "Каждая операция (нового типа) заносится в exampleOperations, это нужно для примера,
 чтобы через n-ое кол-во времени быстро въехать и найти нужную операцию."

 Типы операций:

 - 'arcgisFeaturesToGeojson':
 Подключение к FeatureServer => получение всех features => возвращает featureCollection (есть возможность задать конвертацию из системы координат:
 Например:
 coordSystemConvertOperation может быть:
 null;
 inverse - Convert mercator x, y values to lon, lat;
 forward - Convert lon, lat values to mercator x, y;).

 - 'geoJsonToNedb':
 Создает коллекицю => записывает данные

 - 'filtering'
 [
 * 'byDistance' - выбор объектов попадающих в пределах заданного расстояния
 ]

 */

const exampleOperations = {
  o1: {
    despription: 'Получение из ArcgisFeatureServer`a объектов слоя избирательные участки и сохранение geojson в файле.',
    run: (callback = () => {
    }) => {
      const filePath = path.resolve(__dirname, 'some-data/iz_uchastki2016.json');
      const props = {
        featureServerUrl: 'http://gisweb.chebtelekom.ru/arcgis/rest/services/cheb/vybory_dep_iu_2016/FeatureServer/1',
        coordSystemConvertOperation: 'inverse',
        /* coordSystemConvertOperation can be:
         null;
         inverse - Convert mercator x, y values to lon, lat;
         forward - Convert lon, lat values to mercator x, y;
         */
      };
      arcgisFeaturesToGeojson(
        props,
        function (err, featureCollection) {
          if (err) {
            console.log(err.message);
            return callback(err);
          }
          writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath }, callback);
        });
    }
  },
  o2: {
    description: 'Перегон из GeoJSON в коллекцию nedb объектов камеры школ(для выборов) для пингера.',
    run: (callback = () => {
    }) => {
      const filePath = path.resolve(__dirname, 'some-data/school.json');
      const props = {
        nedbCollectionName: 'SchoolCamsForVoting',
        docs: require(filePath)
      };
      jsonToNedb(props, callback);
    }
  },
  o3: {
    description: 'Фильтр: выбор школьных камер находящихся в пределах 500м от из. пунктов => запись в файл',
    run (callback = () => {
    }) {
      const resultFilePath = path.resolve(__dirname, 'some-data/school-voting.json');
      const school = require(path.resolve(__dirname, 'some-data/school.json'));
      const iu_pointsFeatureCollection = require(path.resolve(__dirname, 'some-data/iz_uchastki_points2016.json'));
      const props = {
        featuresFrom: iu_pointsFeatureCollection.features,
        featuresTo: school,
        featuresToUniqKey: '_id'
      };
      filterByDistance(props, (err, features) => {
        if (err) {
          console.log(err.message);
          return callback(err);
        }
        const featureCollection = {
          type: 'FeatureCollection',
          features
        };
        writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath: resultFilePath }, callback);
      });
    }
  },
  // oN: {
  //   description: '',
  //   run (callback = () => {}) {
  //
  //   }
  // },
};

// все операции которые когда либо выполнялись в этом проекте.
const operations = {
  o1: {
    despription: 'Получение из ArcgisFeatureServer`a объектов слоя избирательные участки и сохранение в файле geojson.',
    proto: 'o1',
    run: (callback = () => {
    }) => {
      const filePath = path.resolve(__dirname, 'some-data/iz_uchastki_points2016.json');
      const props = {
        featureServerUrl: 'http://gisweb.chebtelekom.ru/arcgis/rest/services/cheb/vybory_dep_iu_2016/FeatureServer/0',
        coordSystemConvertOperation: 'inverse'
      };
      arcgisFeaturesToGeojson(
        props,
        function (err, featureCollection) {
          if (err) {
            console.log(err.message);
            return callback(err);
          }
          writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath }, callback);
        });
    }
  },
  o2: {
    description: 'Перегон из GeoJSON в коллекцию nedb объектов камеры школ(уже отфильтрованные по дистанции) для' +
    ' пингера.',
    run: (callback = () => {
    }) => {
      const filePath = path.resolve(__dirname, 'some-data/school-voting.json');
      const props = {
        nedbCollectionName: 'SchoolCamsVotingFiltered',
        docs: require(filePath).features
      };
      jsonToNedb(props, callback);
    }
  },
  o3: {
    despription: 'Получение из ArcgisFeatureServer`a объектов слоя нежил. помещения полигоны и сохранение в файле' +
    ' geojson.',
    run: (callback = () => {
    }) => {
      const filePath = path.resolve(__dirname, 'some-data/nezhil-pomesh.json');
      const props = {
        featureServerUrl: 'https://chebtelekom.ru/arcgis/rest/services/pomesheniya/nezhil_pom_poligon/FeatureServer/0',
        coordSystemConvertOperation: 'inverse',
        username: '****',
        password: '****'
        /* coordSystemConvertOperation can be:
         null;
         inverse - Convert mercator x, y values to lon, lat;
         forward - Convert lon, lat values to mercator x, y;
         */
      };
      arcgisFeaturesToGeojson(
        props,
        function (err, featureCollection) {
          if (err) {
            console.log(err.message);
            return callback(err);
          }
          writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath }, callback);
        });
    }
  },
  o4: {
    despription: 'Получение из ArcgisFeatureServer`a объектов слоя stroeniya всех фичеров и сохранение в файле geojson.',
    proto: 'o1',
    run: (callback = () => {
    }) => {
      const filePath = path.resolve(__dirname, 'some-data/stroeniya.json');
      const { servicesUrl, username, password } = connections.arcgis[1];
      const props = {
        featureServerUrl: servicesUrl + // '/pomesheniya/nezhil_pom_v8/FeatureServer/0',
        '/test/stroeniya/FeatureServer/0',
        coordSystemConvertOperation: 'inverse',
        username: username,
        password: password
      };
      arcgisFeaturesToGeojson(
        props,
        function (err, featureCollection) {
          if (err) {
            console.log(err.message);
            return callback(err);
          }
          console.log('write to file', featureCollection.features.length);
          writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath }, callback);
        });
    }
  },
  o5: {
    despription: 'Получение из ArcgisFeatureServer`a объектов слоя nezhil_pomesh всех фичеров и сохранение в файле geojson.',
    proto: 'o1',
    run: (callback = () => {
    }) => {
      const filePath = path.resolve(__dirname, 'some-data/nezhil_pomesh_points.json');
      const { servicesUrl, username, password } = connections.arcgis[1];
      const props = {
        featureServerUrl: servicesUrl + '/pomesheniya/nezhil_pom_v8/FeatureServer/0',
        username: username,
        password: password
      };
      arcgisFeaturesToGeojson(
        props,
        function (err, featureCollection) {
          if (err) {
            console.log(err.message);
            return callback(err);
          }
          console.log('write to file', featureCollection.features.length);
          writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath }, callback);
        });
    }
  },
  o6: {
    despription: 'Получение массива полигонов в которые попали точки => сохранение в файл stroeniya_polygons_preresult geojson.',
    run: (callback = () => {
    }) => {
      const fcPoints = require(path.resolve(__dirname, 'some-data/nezhil_pomesh_points.json'));
      const fcPolygons = require(path.resolve(__dirname, 'some-data/stroeniya.json'));
      const filePath = path.resolve(__dirname, 'some-data/stroeniya_polygons_preresult.json');
      const props = {
        fcPoints,
        fcPolygons,
        filePath
      };
      const insidePolygonsFeatures = getFeaturesByPointsInsidePolygons(fcPoints, fcPolygons);
      const featureCollection = {
        type: 'FeatureCollection',
        features: insidePolygonsFeatures
      };
      console.log('write to file', featureCollection.features.length);
      writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath }, callback);
    }
  },
  o7: {
    despription: 'По массиву полигонов ищем близлежащие (для получения всех строений по этому адресу (арки, подъезды, пристрои)))',
    run: (callback = () => {
    }) => {
      const fcPoints = require(path.resolve(__dirname, 'some-data/nezhil_pomesh_points.json'));
      const fcPolygons = require(path.resolve(__dirname, 'some-data/stroeniya.json'));
      const insidePolygonsFc = require(path.resolve(__dirname, 'some-data/stroeniya_polygons_preresult.json'));
      const filePath = path.resolve(__dirname, 'some-data/stroeniya_result.json');
      const props = {
        fcPoints,
        fcPolygons,
        filePath,
        insidePolygonsFc
      };
      // insidePolygonsFc.features = insidePolygonsFc.features.filter((feature) => {
      //   return feature.properties.RegisterNo === '00010003D30E' || feature.properties.RegisterNo  === '00010003FDE0';
      // });
      const stroeniyaFeatures = findBuildingsByPolygons(insidePolygonsFc.features, fcPolygons.features, 0.2, 'kilometers');
      const features = [];
      stroeniyaFeatures.forEach((feature) => {
        const area = turfArea(feature);
        feature.properties['Площадь'] = area;
        features.push(feature);
      });

      const featureCollection = {
        type: 'FeatureCollection',
        features: features
      };
      console.log('write to file', featureCollection.features.length);
      writeToFile({ data: JSON.stringify(featureCollection, null, 2), filePath }, callback);
    }
  },
};

export {operations, exampleOperations};
