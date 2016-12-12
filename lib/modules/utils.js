import fs from "fs";
import "isomorphic-fetch";

export function writeToFile ({ data, filePath }, callback) {
  try {
    if (fs.statSync(filePath)) {
      return callback(new Error('Файл по пути: ' + filePath + ' уже существует.'));
    }
  } catch (e) {
  }
  // var ws = fs.createWriteStream(filePath);
  //
  // ws.on('finish', () => {
  //   return callback();
  // });
  // ws.on('error', (err) => {
  //   return callback(err);
  // });
  //
  // ws.write(data);
  // ws.end();

  fs.writeFile(filePath, data, (err) => {
    return callback(err);
  });
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
// + передаем свои доп. пропсы
export function prepOpFooV2 (opList, oId, props = {}) {
  return (prms, callback) => {
    if (typeof prms === 'function') {
      callback = prms;
      prms = props;
    } else {
      prms = { ...prms, ...props };
    }
    opList[oId].run(prms, (err, res) => {
      if (err) {
        console.log(oId, 'err =>', err.message);
        return callback(err);
      } else {
        console.log(oId, '=> done.');
        return callback(null, { ...prms, ...res });
      }
    });
  };
}
// + передаем функцию подготовки пропсов (для подготовки пропсов на основе текущего контекста)
export function prepOpFooV3 (opList, oId, prepProps = ({}) => {}) {
  return (prms, callback) => {
    if (typeof prms === 'function') {
      callback = prms;
      prms = prepProps({});
    } else {
      prms = { ...prms, ...prepProps(prms) };
    }
    opList[oId].run(prms, (err, res) => {
      if (err) {
        console.log(oId, 'err =>', err.message);
        return callback(err);
      } else {
        console.log(oId, '=> done.');
        return callback(null, { ...prms, ...res });
      }
    });
  };
}

export function splitArray (input, spacing) {
  var output = [];
  for (var i = 0; i < input.length; i += spacing)
    output[output.length] = input.slice(i, i + spacing);
  return output;
}

export function progressConsole (i, number, message) {
  if (i % number === 0) {
    console.log(message, i);
  }
}

export function get (url) {
  return fetch(url)
    .then(res => {
      if (res.status >= 400) {
        throw new Error('Error, bad connection provaiders!');
      }
      return res.json();
    });
}