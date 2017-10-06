import {exampleOperations} from "./../../operations-history-config";
import async from "async";
import {prepOpFooV2} from "./utils";
import {geocode} from "./../modules/ya-geocoder";

export default {
  run (callback) {
    async.waterfall([
      prepOpFooV2(exampleOperations, 'o6', {
        xlsxFilePath: './some-data/Список IP адресов школы дек.2016 v2.xlsx',
        sheetName: 'Видеокамеры Школы (2)'
      }),
      function (prms, callback) {
        const headers = [
          'HEX архив',
          'IP-адрес маршрутизатора',
          'IP-адрес регистратора',
          'Наименование Школы',
          'видеосервер',
          'Номер внешнего хранилища'
        ];
        let prevFeature;
        prms.resFeatures = {};
        async.eachLimit(Object.keys(prms.xlsxFeatures), 1, (key, done) => {
          const feature = prms.xlsxFeatures[key];
          if (feature['видеосервер']) {
            switch (feature['видеосервер']) {
              case 'SN8':
                feature['видеосервер'] = '10.157.199.7';
                break;
              case 'SN9':
                feature['видеосервер'] = '10.157.199.8';
                break;
              default:
                throw new Error('feature[\'видеосервер\'] not supported');
                break;
            }
          }

          function changeName (address) {
            const list = {
              'Стрел. див.': 'Стрелковой дивизии'
            };
            Object.keys(list).forEach((key) => {
              if (address.match(key)) {
                address = address.replace(key, list[key]);
                console.log('replaced to ', address);
              }
            });
            return address;
          }

          function prepFeature (feature, geometry) {
            headers.forEach(header => {
              if (!feature[header] && prevFeature) {
                feature[header] = prevFeature[header];
              } else {
                prevFeature = feature;
              }
            });
            const resFeature = {
              geometry,
              properties: {}
            };
            feature.forEach(key => {
              resFeature.properties[key] = feature[key];
            });
            prms.resFeatures[key] = resFeature;
            return done();
          }

          if (feature['Наименование Школы']) {
            if (feature['coordinates']) {
              prepFeature(feature, {
                type: 'Point',
                coordinates: feature['coordinates'],
              });
            } else {
              geocode({ address: 'г. Чебоксары,' + changeName(feature['address']) })
                .then(({Point, metaDataProperty}) => {
                  console.log(metaDataProperty.GeocoderMetaData.formatted);
                  const coordinates = Point.split(' ');
                  prepFeature(feature, {
                    type: 'Point',
                    coordinates
                  });
                })
                .catch((err) => {
                  console.log('err', feature['address'], err.message);
                });
            }
          } else {
            prepFeature(feature, prevFeature.geometry);
          }
        }, (err) => {
          return callback(err, prms);
        });
      },
      function (prms, callback) {

      }
    ], callback);
  }
}
