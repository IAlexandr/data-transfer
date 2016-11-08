import {operations, exampleOperations} from './operations-history-config';
import complex1 from './lib/modules/complex-ops-arcgis-get-polygons-by-points';
import async from 'async';
import {prepOpFoo} from './lib/modules/utils';

// complex1.run((err) => {
//   if (err) {
//     console.log('err:', err.message);
//   } else {
//     console.log('Finish.');
//   }
// });
// Место для запуска на выполнение операции/й


async.waterfall([
  // prepOpFoo(exampleOperations, 'o3')
 prepOpFoo(operations, 'o9')
], (err) => {
  if (err) {
    console.log('err:', err.message);
  } else {
    console.log('Finish.');
  }
});

