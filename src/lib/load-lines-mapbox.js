import flatten from 'geojson-flatten';
import {tile} from 'd3-tile';
import {VectorTile} from '@mapbox/vector-tile';
import getProjection from './get-projection';
import Protobuf from 'pbf';

const API_KEY = 'fApLQBTwQbaIclmV0CoOQA';
const TILE_BASE_URL = 'https://tile.nextzen.org/tilezen/vector/v1/256/all/';
const INCLUDED_LAYERS = ['road', 'water'];
const EXCLUDED_FEATURES = ['ferry', 'pedestrian'];

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

  const getUrl = ({x,y,z}) => `https://a.tiles.mapbox.com/v4/mapbox.mapbox-terrain-v2,mapbox.mapbox-streets-v7/${z}/${x}/${y}.vector.pbf?access_token=pk.eyJ1IjoidWJpbGFicyIsImEiOiJ4Tm02bDJrIn0.aA51umnsZbzugtBiFLZPoQ`;

  const geojsons = [];

  for (const visibleTile of visibleTiles) {
    const buffer = await fetch(getUrl(visibleTile)).then(res => res.arrayBuffer());
    const vectorLayers = new VectorTile(new Protobuf(buffer));

    for (const layer of Object.values(vectorLayers.layers)) {
      if (!INCLUDED_LAYERS.includes(layer.name)) {continue;}

      for (let i = 0; i < layer.length; i++) {
        const feature = layer.feature(i);
        const geojson = feature.toGeoJSON(visibleTile.x, visibleTile.y, visibleTile.z);

        if (EXCLUDED_FEATURES.includes(geojson.properties.type)) {
          continue;
        }

        // flatten multi polygon strings
        if (geojson.geometry.type === 'MultiPolygon') {
          geojson.geometry.coordinates = geojson.geometry.coordinates
            .reduce((all, item) => all.concat(item), []);
        }

        geojsons.push(geojson);
      }
    }
  }

  return geojsons;
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
  const features = await loadTiles(viewport);
  return getLines(features);
}
