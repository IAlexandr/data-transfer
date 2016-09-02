import Datastore from 'nedb';
import async from 'async';
const db = {};

const dbCollections = {
  // test: { name: 'Test' },
};

// todo не все методы проверены!!!
function crud (colName) {
  return {
    // TODO (+sort) => (expression, {limit, skip, sort}, () => {}
    find: (expression, limit, skip, cb) => {
      db[colName].find(expression).limit(limit).skip(skip).exec((err, docs) => {
        return cb(err, docs);
      });
    },
    findById: (id, cb) => {
      db[colName].find({ _id: id }).exec((err, docs) => {
        return cb(err, docs[0]);
      });
    },
    insert: (docs, cb) => {
      function insert (doc, done) {
        db[colName].insert(doc, (err, resultDoc) => {
          return done(err, resultDoc);
        });
      }
      if (Object.prototype.toString.call( docs ) === '[object Array]') {
        const resultDocs = [];
        async.eachLimit(docs, 1, (doc, done) => {
          insert(doc, (err, resultDoc) => {
            resultDocs.push(resultDoc);
            return done(err);
          });
        }, (err) => {
          return cb(err, resultDocs);
        });
      } else {
        insert(docs, cb);
      }
    },
    remove: (expression, cb) => {
      db[colName].remove(expression, { multi: true }, (err) => {
        return cb(err);
      });
    },
    removeById: (id, cb) => {
      db[colName].find({ _id: id }).exec((err, docs) => {
        if (err) {
          return cb(err);
        }
        if (!docs[0]) {
          return cb(null, 0);
        }
        db[colName].remove({ _id: id }, (err) => {
          return cb(err, 1);
        });
      });
    },
    update: (expression, data, cb) => {
      db[colName].update(expression, { $set: data }, { multi: true }, (err, numReplaced) => {
        return cb(err, numReplaced);
      });
    },
    updateById: (id, data, cb) => {
      db[colName].update({ _id: id }, { $set: data }, {}, (err, numReplaced) => {
        return cb(err, numReplaced);
      });
    }
  };
}
const resultDb = { db };

createCollections();

export function createCollection (colName) {
  db[colName] = new Datastore('nedb/' + colName + '.db');
  db[colName].loadDatabase();
  db[colName].persistence.setAutocompactionInterval(1000 * 60 * 1);
  resultDb[colName] = crud(colName);
}

function createCollections () {
  Object.keys(dbCollections).forEach((col) => {
    const colName = dbCollections[col].name;
    createCollection(colName);
  });
}


export default resultDb;
