import async from "async";
import {prepOpFooV2, writeToFile} from "./utils";
import {operations, exampleOperations} from "./../../operations-history-config";
import {default as nedb} from './../db/nedb';
/*
 Комплексное решение
 добавление поля camNum в itv connection
 номер камеры берем из xls списка камер (поиск по IP)
 */

export default {
  run (callback) {
    async.waterfall([
      prepOpFooV2(exampleOperations, 'o6', {
        xlsxFilePath: './some-data/БД2016.xlsx',
        sheetName: 'БД3-2016'
      }),
      function (prms, callback) {
        const resultFeaturesByIP = {
          noIp: []
        };
        Object.keys(prms.xlsxFeatures).forEach((featureKey) => {
          const feature = prms.xlsxFeatures[featureKey];
          if (feature.hasOwnProperty('№ ITV')) {
            if (feature.hasOwnProperty('IP-адрес') && feature['IP-адрес'] != "") {
              resultFeaturesByIP[feature['IP-адрес']] = feature;
            } else {
              resultFeaturesByIP['noIp'].push(feature);
            }
          }
        });
        prms['resultFeaturesByIP'] = resultFeaturesByIP;
        return callback(null, prms);
      },
      function (prms, callback) {
        let updatedList = 0;
        async.eachLimit(prms.resultFeaturesByIP, 1, (feature, done) => {
          if (Object.prototype.toString.call(feature) === '[object Array]') {
            async.eachLimit(feature, 1, (featureWIthoutIp, next) => {
              exampleOperations['o9'].run({
                nedb,
                method: 'find',
                colName: 'bd2016',
                expression: { 'properties.address': featureWIthoutIp['Адрес дома'] },
                resultPrmsKey: 'nedbDocs'
              }, (err, nedbDocs) => {
                if (err) {
                  return next(err);
                }
                if (nedbDocs.length > 0) {
                  const doc = nedbDocs[0];
                  doc.properties.connectionOptions.itv.camId = featureWIthoutIp['№ ITV'].toString();
                  exampleOperations['o10'].run({
                    nedb,
                    method: 'updateById',
                    colName: 'bd2016',
                    expression: { 'properties.connectionOptions.direct.ip': featureWIthoutIp['IP-адрес'] },
                    doc,
                    resultPrmsKey: 'nedbDoc'
                  }, (err) => {
                    if (err) {
                      return next(err);
                    }
                    updatedList++;
                    return next();
                  });
                } else {
                  return next(new Error("nedbDocs.length < 0"));
                }
              });
            }, (err) => {
              return done(err);
            });
          } else {
            exampleOperations['o9'].run({
              nedb,
              method: 'find',
              colName: 'bd2016',
              expression: { 'properties.connectionOptions.direct.ip': feature['IP-адрес'] },
              resultPrmsKey: 'nedbDocs'
            }, (err, nedbDocs) => {
              if (err) {
                return done(err);
              }
              if (nedbDocs.length > 0) {
                const doc = nedbDocs[0];
                doc.properties.connectionOptions.itv.camId = feature['№ ITV'].toString();
                exampleOperations['o10'].run({
                  nedb,
                  method: 'updateById',
                  colName: 'bd2016',
                  expression: { 'properties.connectionOptions.direct.ip': feature['IP-адрес'] },
                  doc,
                  resultPrmsKey: 'nedbDoc'
                }, (err) => {
                  if (err) {
                    return done(err);
                  }
                  updatedList++;
                  return done();
                });
              } else {
                return done(new Error("nedbDocs.length < 0"));
              }
            });
          }
        }, (err) => {
          console.log('updatedList ', updatedList);
          return callback(err);
        });
      },
    ], callback);
  }
}