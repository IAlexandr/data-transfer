import {operations, exampleOperations} from "./../../operations-history-config";
import {prepOpFooV2, writeToFile} from "./utils";
import async from "async";

/*
 * Комплексное решение
 *   => exampleOperations.o6 Считываем xls файл со списком Наименование техники \ id
 *   => exampleOperations
 *   =>
 * */

function nameParse (name) {
  const number = name.match(/.{1,5}/);
  const alias = name.match(/\(([^\)]*)/);
  let v = '';
  if (alias[1]) {
    v = `${number} УК [${alias[1]}]`;
  }
  return v;
}

export default {
  run (callback) {
    async.waterfall([
      prepOpFooV2(exampleOperations, 'o6', {
        xlsxFilePath: './some-data/список техники ЧТ.xlsx',
        sheetName: 'Лист1'
      }),
      function (prms, callback) {
        prms.techList = Object.keys(prms.xlsxFeatures).map((featureKey) => {
          const feature = prms.xlsxFeatures[featureKey];
          feature['Наименование'] = nameParse(feature['Наименование']);
          return feature;
        });
        return callback(null, prms);
      },
      function (prms, callback) {
        prms.data = prms.techList.reduce((res, cur) => {
          res += cur['Наименование'] + '\r\n';
          res += cur['id'] + '\r\n';
          return res;
        }, '');
        return callback(null, prms);
      },
      function (prms, callback) {
        const filePath = './some-data/info.txt';
        writeToFile({filePath, data: prms.data}, callback);
      }
    ], callback);
  }
}
