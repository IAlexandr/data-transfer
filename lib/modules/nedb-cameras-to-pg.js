import {operations, exampleOperations} from "./../../operations-history-config";
import {get} from './utils';

/*
 Комплексное решение получения камер из mapcam <= (camera-ping-image) по слоям
 */

export default {
  run (callback) {
    async.waterfall([
      // Получение из ArcgisFeatureServer`a объектов слоя stroeniya всех фичеров и сохранение в файле stroeniya.json. BIGDATA, долго получает и сохраняет.
      // prepOpFoo(operations, 'o4')
      // Получение из ArcgisFeatureServer`a объектов слоя nezhil_pomesh всех фичеров и сохранение в файле geojson.
      // prepOpFoo(operations, 'o5')
      //  prepOpFoo(operations, 'o6')
      prepOpFoo(operations, 'o7')
    ], callback);
  }
}
