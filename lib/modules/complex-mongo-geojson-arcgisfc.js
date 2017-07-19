import {exampleOperations} from "./../../operations-history-config";
import async from "async";
import terraformerArcgisParser from 'terraformer-arcgis-parser';
import {prepOpFooV2} from "./utils";
import mongoose from 'mongoose';
import FcSchema from './../db/mongo/models/fc';
import projconvert from './object-transformer';

mongoose.connect('mongodb://10.2.0.24:27017/parcel-manager');
const db = {
  mongoose,
  Zu: mongoose.model('Zu', FcSchema)
};

export default {
  run (callback) {
    async.waterfall([
      prepOpFooV2(exampleOperations, 'o7', {
        db,
        method: 'count',
        colName: 'Zu',
        expression: { 'fileId': db.mongoose.Types.ObjectId('5943923b5cca9a440ebb46f2') },
        resultPrmsKey: 'zuCount'
      }),
      (prms, callback) => {
        prms.skip = 0;
        prms.limit = 1000;

        function byLimit (prms, callback) {
          prepOpFooV2(exampleOperations, 'o11', {
            db,
            method: 'find',
            colName: 'Zu',
            expression: { 'fileId': db.mongoose.Types.ObjectId('5943923b5cca9a440ebb46f2') },
            skip: prms.skip,
            limit: prms.limit,
            resultPrmsKey: 'ZUfromMongo'
          })(prms, (err, prms) => {
            if (err) {
              return callback(err);
            }
            if (prms.ZUfromMongo.length < prms.max) {
              prms.skip += prms.limit;
              if (prms.max < (prms.skip + prms.limit + prms.limit)) {
                prms.limit = prms.max - prms.skip;
              }
              return byLimit(prms, callback);
            } else {
              return callback(null, prms);
            }
          });
        }

        byLimit({ skip: 0, limit: 1000, max: prms.zuCount }, (err, prms) => {
          if (err) {
            console.log(err.message);
            return callback(err);
          }
          console.log(prms.ZUfromMongo.length);
          return callback(null, prms);
        });
      },
      (prms, callback) => {
        prms.features = prms.ZUfromMongo.reduce((v, n) => {
          const feature = projconvert(n);
          const o = {
            attributes: {
              'address': feature.properties['Адрес_участка'],
              "cadNum": feature.properties['cadNum'],
              "cadNumZu": feature.properties['cadNumZu'],
            },
            geometry: terraformerArcgisParser.convert(feature.geometry)
          };
          v.push(o);
          return v;
        }, []);
        return callback(null, prms);
      },
      (prms, callback) => {
        // TODO save to arcgisFc
      }
    ], callback);
  }
}
