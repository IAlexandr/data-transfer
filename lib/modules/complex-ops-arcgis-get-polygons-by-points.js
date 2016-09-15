import {operations, exampleOperations} from './../../operations-history-config';
import {prepOpFoo} from './utils';

/*
 Комплексное решение получения всех полигонов(плюс прилегающие) из слоя (FeatureServer) в которые попали точки из
 другого слоя (FeatureServer)
 */

export default {
  run (callback) {
    async.waterfall([
      prepOpFoo(operations, 'o4')
    ], callback);
  }
}
