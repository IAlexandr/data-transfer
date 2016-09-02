import { default as nedb, createCollection} from './../db/nedb';

export default function (props, callback) {
  const { docs, nedbCollectionName } = props;
  if (!nedb.hasOwnProperty(nedbCollectionName)) {
    createCollection(nedbCollectionName);
  }
  nedb[nedbCollectionName].insert(docs, callback);
}
