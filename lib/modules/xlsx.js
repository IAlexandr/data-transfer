import cellStyles from './cell-style-templates';
const alphabet = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];

function prepRef (c, r) {

  return 'A1:' + prepIndexLetters(c - 1) + r;
}

export function prepIndexLetters (i) {

  function prepLetters (i, resultLetters = []) {
    const letterCount = Math.ceil(i / 25);
    const letterIndex = Math.ceil(letterCount / 26) - 1;
    if (letterCount > 1) {
      // Мало вероятно, что
      resultLetters.push(alphabet[letterIndex]);
      resultLetters = (prepLetters(i - 26, resultLetters));
    } else {
      resultLetters = [alphabet[i]].concat(resultLetters);
    }
    return resultLetters;
  }

  return prepLetters(i).reverse().join('');
}

function prepHeaderRow (fields, headerStyle) {
  const headers = {};
  fields.forEach((field, i) => {
    const letters = prepIndexLetters(i);
    headers[letters + '1'] = {
      v: field.alias || field.name,
      s: headerStyle,
      i,
      letters,
      name: field.name
    };
  });
  return headers;
}

export function featuresInfoToSheet (featuresInfo, headerStyle = cellStyles.header1, bodyStyle = cellStyles.body1) {
  const columns = featuresInfo.fields.length;
  const rows = featuresInfo.features.length;
  let sheet = {
    '!cols': [],
    '!ref': prepRef(columns, rows), // TODO FAIL add columns - 1
  };

  const fields = featuresInfo.fields.filter(field => field.name !== featuresInfo.objectIdFieldName);
  const headers = prepHeaderRow(fields, headerStyle);
  const headersArray = Object.keys(headers).map(key => headers[key]);
  headersArray.forEach(header => {
    sheet[header.letters + '1'] = { v: header.v, s: header.s, t: 's' };
  });
  featuresInfo.features.map((feature, i) => {
    headersArray.forEach(header => {
      sheet[header.letters + (i + 2)] = {
        v: feature.attributes[header.name] || 'Нет данных',
        s: bodyStyle,
        t: 's'
      };
    });
  });
  return sheet;
}

export function featuresToWorkBook ({ featuresInfo, sheetName, headerStyle, bodyStyle }) {
  const sheet = featuresInfoToSheet(featuresInfo, headerStyle, bodyStyle);
  return {
    Sheets: { [sheetName]: sheet },
    SheetNames: [sheetName]
  };
}
