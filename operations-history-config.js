import path from 'path';
import arcgisFeaturesToGeojson from './lib/modules/arcgis-features-to-geojson';
import geoJsonToNedb from './lib/modules/geojson-to-nedb';

// каждая операция (нового типа) заносится сюда, это нужно для примера, чтобы через n-ое кол-во времени быстро въехать.
const exampleOperations = {
  o1: {
    despription: 'Получение из ArcgisFeatureServer`a объектов слоя избирательные участки и сохранение в файле geojson.',
    run: (callback = () => {}) => {
      const props = {
        featureServerUrl: 'http://gisweb.chebtelekom.ru/arcgis/rest/services/cheb/vybory_dep_iu_2016/FeatureServer/1',
        filePath: path.resolve(__dirname, 'some-data/iz_uchastki2016.json'),
      };
      arcgisFeaturesToGeojson.writeToFile(
        props,
        function (err) {
          if (err) {
            console.log(err.message);
          } else {
            console.log('file saved.');
          }
          return callback(err);
        });
    }
  },
  o2: {
    description: 'Перегон из GeoJSON в коллекцию nedb объектов камеры школ(для выборов) для пингера.',
    run: (callback = () => {}) => {
      const props = { filePath: path.resolve(__dirname, 'some-data/school.json'), nedbCollectionName: 'SchoolCamsForVoting' };
      geoJsonToNedb(props, (err) => {
        if (err) {
          console.log(err.message);
        } else {
          console.log('GeoJSON to nedb: Finished. ', props);
        }
        return callback(err);
      });
    }
  },
  // o3: {
  //   description: '',
  //   run (callback) {
  //
  //   }
  // },
};

// все операции которые когда либо выполнялись в этом проекте.
const operations = {
  o1: {
    despription: 'Получение из ArcgisFeatureServer`a объектов слоя избирательные участки и сохранение в файле geojson.',
    run: (callback = () => {}) => {
      const props = {
        featureServerUrl: 'http://gisweb.chebtelekom.ru/arcgis/rest/services/cheb/vybory_dep_iu_2016/FeatureServer/0',
        filePath: path.resolve(__dirname, 'some-data/iz_uchastki_points2016.json'),
      };
      arcgisFeaturesToGeojson.writeToFile(
        props,
        function (err) {
          if (err) {
            console.log(err.message);
          } else {
            console.log('file saved.');
          }
          return callback(err);
        });
    }
  },
};

export { operations, exampleOperations };
