import {exampleOperations} from "./../../operations-history-config";
import async from "async";
import {prepOpFooV2, validateKeys} from "./utils";
import {geocode} from "./../modules/ya-geocoder";
import jsonToNedb from "./json-to-nedb";

export default {
  run (callback) {
    async.waterfall([
      prepOpFooV2(exampleOperations, 'o6', {
        xlsxFilePath: './some-data/Список IP адресов школы дек.2016 v2.xlsx',
        sheetName: 'Видеокамеры Школы (2)',
        headersValidateFoo: validateKeys
      }),
      function (prms, callback) {
        const headers = [
          'HEX архив',
          'IP-адрес маршрутизатора',
          'IP-адрес регистратора',
          'Наименование Школы',
          'видеосервер',
          'Номер внешнего хранилища',
          'address'
        ];
        let prevFeature;
        prms.resFeatures = {};
        console.log('prms.xlsxFeatures:', Object.keys(prms.xlsxFeatures).length);
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
              'Стрел. див.': 'Стрелковой дивизии',
              'Трактор-лей': 'Тракторостроителей',
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
                prevFeature.geometry = geometry;
              }
            });
            const resFeature = {
              geometry,
              properties: {}
            };
            Object.keys(feature).forEach(key => {
              resFeature.properties[key] = feature[key];
            });
            prms.resFeatures[key] = resFeature;
            console.log('---------------');
            return done();
          }

          function praseFloatCoordinates (coords) {
            return coords.map(c => parseFloat(c));
          }

          if (feature['Наименование Школы']) {
            if (feature['coordinates']) {
              prepFeature(feature, {
                type: 'Point',
                coordinates: praseFloatCoordinates(feature['coordinates'].split(' '))
              });
            } else {
              geocode({ address: 'г. Чебоксары,' + changeName(feature['address']) })
                .then(({Point, metaDataProperty}) => {
                  console.log(metaDataProperty.GeocoderMetaData.text);
                  const coordinates = praseFloatCoordinates(Point.pos.split(' '));
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
        prms.resFeatures = Object.keys(prms.resFeatures).map(key => {
          const feature = prms.resFeatures[key];
          return {
            type: 'Feature',
            geometry: feature.geometry,
            properties: {
              address: feature.properties['Адрес - наименование для ITV'],
              status: 'Включена',
              cameraModel: 'hikvision',
              schoolName: feature.properties['Наименование Школы'],
              archHEX: feature.properties['HEX архив'],
              externalStorage: feature.properties['Номер внешнего хранилища'],
              routerIp: feature.properties['IP-адрес маршрутизатора'],
              connectionOptions: {
                cameraType: 'hikvision',
                direct: {
                  ip: feature.properties['IP-адрес регистратора'],
                  userName: 'admin',
                  password: 'mwd21',
                  numCam: feature.properties['№ камеры в школе'],
                  blocked: true,
                },
                itv: {
                  ip: feature.properties['видеосервер'],
                  camId: feature.properties['номер камеры в ITV'],
                  blocked: false
                },
              },
              ptz: false,
            }
          }
        });
        return callback(null, prms);
      },
      function (prms, callback) {
        const props = {
          nedbCollectionName: 'school',
          docs: prms.resFeatures
        };
        jsonToNedb(props, callback);
      },
      function (prms, callback) {
        console.log('!!!');
      }
    ], callback);
  }
}
