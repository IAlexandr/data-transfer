import {operations} from './../../operations-history-config';
import {prepOpFoo} from './utils';
import async from 'async';

/*
 Комплексное решение получения всех полигонов(плюс прилегающие) из слоя (FeatureServer) в которые попали точки из
 другого слоя (FeatureServer)
 */

export default {
  run (callback) {
    async.waterfall([
      // Получение из ArcgisFeatureServer`a объектов слоя stroeniya всех фичеров и сохранение в файле stroeniya.json. BIGDATA, долго получает и сохраняет.
      // prepOpFoo(operations, 'o4')
      // Получение из ArcgisFeatureServer`a объектов слоя nezhil_pomesh всех фичеров и сохранение в файле geojson.
      // prepOpFoo(operations, 'o5')
       prepOpFoo(operations, 'o6')
    ], callback);
  }
}
