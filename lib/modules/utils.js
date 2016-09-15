import fs from 'fs';

export function writeToFile ({ data, filePath}, callback) {
  try {
    if (fs.statSync(filePath)) {
      return callback(new Error('Файл по пути: ' + filePath + ' уже существует.'));
    }
  } catch (e) {}
  var ws = fs.createWriteStream(filePath);

  ws.on('finish', () => {
    return callback();
  });
  ws.on('error', (err) => {
    return callback(err);
  });

  ws.write(data);
  ws.end();
}

export function valBy (ns, obj) {
  const levels = ns.split('.');
  const first = levels.shift();
  if (typeof obj[first] === 'undefined') {
    return undefined;
  }
  if (levels.length) {
    return valBy(levels.join('.'), obj[first]);
  }
  return obj[first];
}

export function prepOpFoo (opList, oId) {
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
