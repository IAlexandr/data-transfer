import {operations, exampleOperations} from './operations-history-config';
import async from 'async';
// Место для запуска на выполнение операции/й

function prepFoo (opList, oId) {
  return (callback) => {
    opList[oId].run((err) => {
      if (err) {
        console.log(oId, 'err =>', err.message);
      } else {
        console.log(oId, '=> done.');
      }
      return callback();
    })
  };
}

async.waterfall([
  prepFoo(exampleOperations, 'o3')
  // prepFoo(operations, 'o1')
], (err) => {
  if (err) {
    console.log('err:', err.message);
  } else {
    console.log('Finish.');
  }
});
