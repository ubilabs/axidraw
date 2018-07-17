import flatten from 'geojson-flatten';
import {tile} from 'd3-tile';

import {TILEZEN_TOKEN} from '../../api-tokens';

import getProjection from './get-projection';

const TILE_BASE_URL = 'https://tile.nextzen.org/tilezen/vector/v1/256/all/';

const EXCLUDE_ROAD_TYPES = ['ferry', 'path', 'minor_road', 'rail'];

/**
 * Loads vector tiles for a given viewport.
 * @param {object} viewport  The viewport with width, heigth, zoom and center
 * @return {Promise<array>} A promise which resolves with an array of tile data
 * objects.
 */
async function loadTiles(viewport) {
  const {width, height} = viewport;
  const projection = getProjection(viewport);
  const visibleTiles = tile()
    .size([width, height])
    .scale(projection.scale() * 2 * Math.PI)
    .translate(projection([0, 0]))();
  const tileUrls = visibleTiles.map(
    tile =>
      `${TILE_BASE_URL}${tile.z}/${tile.x}/${tile.y}.json?api_key=${
        TILEZEN_TOKEN
      }`
  );
  const tilesJsons = await Promise.all(
    tileUrls.map(async tileUrl => {
      const response = await fetch(tileUrl);
      return response.json();
    })
  );

  return tilesJsons;
}

/**
 * Extra line feature coordinates from a list of GeoJSON features.
 * @param {Array<object>} features -
 * @return {Array<array>}  An array of lines
 */
function getLines(features) {
  const flattened = [];
  for (const feature of features) {
    if (feature.geometry.type === 'Point') continue;

    flattened.push(...flatten(feature));
  }

  return flattened.map(feature => feature.geometry.coordinates);
}

/**
 * Load lines features given a viewport.
 * @param {object} viewport  The viewport with width, heigth, zoom and center
 * @return {Promise<array>}  Resolves with a list of lines
 */
export default async function(viewport) {
  const tiles = await loadTiles(viewport);

  const features = [];

  for (const tileData of tiles) {
    features.push(
      ...tileData.roads.features.filter(
        feature => !EXCLUDE_ROAD_TYPES.includes(feature.properties.kind)
      ),
      ...tileData.water.features.filter(
        feature =>
          feature.properties.boundary && feature.geometry.type != 'Point'
      )
    );
  }

  const lines = getLines(features);

  return lines;
}
