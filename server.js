import complexNezhilPomToFs from "./lib/modules/complex-nezhil-pom-to-fs";

// complex1.run((err) => {
//   if (err) {
//     console.log('err:', err.message);
//   } else {
//     console.log('Finish.');
//   }
// });
// Место для запуска на выполнение операции/й


// async.waterfall([
//   // prepOpFoo(exampleOperations, 'o3')
//  prepOpFoo(operations, 'o9')
// ], (err) => {
//   if (err) {
//     console.log('err:', err.message);
//   } else {
//     console.log('Finish.');
//   }
// });

complexNezhilPomToFs.run(err => {
  if (err) {
    console.log('err:', err.message);
  } else {
    console.log('Finish.');
  }
});
