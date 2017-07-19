// import complexNezhilPomToFs from "./lib/modules/complex-nezhil-pom-to-fs";
import complexMongoGeojsonArcgisfc from "./lib/modules/complex-mongo-geojson-arcgisfc";
// import complexXlsWialonTechListToTxt from "./lib/modules/complex-xls-wialon-tech-list-to-txt";
// import nedbXlsFindModify from "./lib/modules/nedb-xls-find-modify";

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

// complexXlsWialonTechListToTxt.run(err => {
//   if (err) {
//     console.log('err:', err.message);
//   } else {
//     console.log('Finish.');
//   }
// });
// nedbXlsFindModify.run(err => {
//   if (err) {
//     console.log('err:', err.message);
//   } else {
//     console.log('Finish.');
//   }
// });

complexMongoGeojsonArcgisfc.run((err) => {
  if (err) {
    console.log(err.message);
  } else {
    console.log('Finish');
  }
});
