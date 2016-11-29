import {operations, exampleOperations} from "./../../operations-history-config";
import {prepOpFooV2} from "./utils";
import async from "async";
import mongoDb from "./../../lib/db/mongo";

/*
 * Комплексное решение // описание устарело!
 *   => exampleOperations.o5 Получение списка адресов из building-texture-editor API (H2)
 *   => exampleOperations.o4 Геокодирование списка адресов из building-texture-editor API (G2)
 *   => проверить наличие более одного объекта в [coords], должно быть не более одного, изменить недочет.
 *   => чтение из xlsx нежил. помещений (H1)
 *   => геокодирование Н1 => группировка по координатам точки {[coords]: { [h1.address]: h1 }} => (G1)
 *   => поиск связей. Проходимся по набору G2
 *         g2.coords === g1.coords ? g1.RegisterNo = g2.RegisterNo; F1[g1.ID] = g1; g2.g1s.push(g1.ID)
 *   =>
 *   =>
 *   =>
 * */

export default {
  run (callback) {
    async.waterfall([
      prepOpFooV2(exampleOperations, 'o6', {
        xlsxFilePath: './some-data/нежилые на 04.05.2016 сортировка по адресу _v2.xlsx',
        sheetName: 'Лист3'
      }),
      prepOpFooV2(operations, 'o11', { db: mongoDb }),
      function (prms, callback) {
        const r = 1;
        // ручная проверка
        // (наличие более одного объекта в [coords], должно быть не более одного, изменить недочет.)
        const addrClones = prms.G2.filter(g2 => Object.keys(g2.source).length);
        if (addrClones.length) {
          console.log('кол-во адресов по которым есть повторения:', addrClones.length);
        }
        return callback(null, prms);
      },
      prepOpFooV2(operations, 'o10'),
    ], callback);
  }
}
