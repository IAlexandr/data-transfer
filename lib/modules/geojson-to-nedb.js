import { default as nedb, createCollection} from './../db/nedb';

export default function (props, callback) {
  const { filePath, nedbCollectionName } = props;
  const docs = require(filePath);
  if (!nedb.hasOwnProperty(nedbCollectionName)) {
    createCollection(nedbCollectionName);
  }
  nedb[nedbCollectionName].insert(docs, callback);
}
