import "isomorphic-fetch";

function get (url) {
  return fetch(url)
    .then(res => {
      if (res.status >= 400) {
        throw new Error('Error, bad connection provaiders!');
      }
      return res.json();
    });
}

function spaceReplace (string) {
  return string.replace(/\s/g, '+');
}

function getFeatureYandex(features) {
  const feature = features
    .filter(i => i.GeoObject.metaDataProperty.GeocoderMetaData.precision === 'exact');
  if (feature.length === 0) {
    throw new Error('Error, feature exact 0!');
  }
  return { ...feature[0].GeoObject };
}

function parseFeatureMemberYandex(features) {
  if (features.length === 0) {
    throw new Error('Error, features null!');
  }
  return getFeatureYandex(features);
}

function parseYandex(json) {
  const check =
    typeof json === 'undefined' &&
    typeof json.response === 'undefined' &&
    typeof json.response.GeoObjectCollection === 'undefined' &&
    typeof json.response.GeoObjectCollection.featureMember === 'undefined';
  if (check) {
    throw new Error('Error, bad response provaiders!');
  }
  const features = json.response.GeoObjectCollection.featureMember;
  return parseFeatureMemberYandex(features);
}

export function geocode ({ address }) {
  const query = spaceReplace(address);
  return get(`https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${encodeURIComponent(query)}`)
    .then(json => parseYandex(json));
}
