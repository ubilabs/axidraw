import max from 'lodash.max';
import min from 'lodash.min';
import perspectiveCamera from 'perspective-camera';

import renderClaim from './assets/logo-and-mapbox-claim';

import Plotter from './lib/plot-coords';
import {renderSVGPaths} from './lib/svg-tools';
import {move, scaleAndMove} from './lib/scale-move';
import convertTextToCoords from './lib/convert-text-to-coords';

import {MAPBOX_TOKEN} from '../api-tokens';

const TILE_SIZE = 400 * window.devicePixelRatio;
const LINES = 80;
const CAMERA_DISTANCE_FACTOR = 1.2;
const OFFSET = {x: -80, y: -120};
const mapOptions = {
  center: [10.373396564972154, 46.40377181364744],
  zoom: 8,
  preserveDrawingBuffer: true
};

const coolPlaces = [
  {
    lng: 138.69807244232152,
    lat: 35.375674249019596,
    zoom: 8.9352830349,
    name: 'Fuji'
  },
  {
    lng: -119.59399848933947,
    lat: 37.74373097805693,
    zoom: 10.731,
    name: 'Yosemite'
  },
  {
    lng: 85.3496795000001,
    lat: 27.695248815918546,
    zoom: 9.758685515456182,
    name: 'Kathmandu'
  },
  {
    lng: -111.812412501538,
    lat: 36.549924781123366,
    zoom: 11.551900766192652,
    name: 'Grand Canyon'
  }
];
renderCoolPlaces(coolPlaces);

mapboxgl.accessToken = MAPBOX_TOKEN;

const map = new mapboxgl.Map(
  Object.assign(
    {
      container: 'map',
      style: {
        version: 8,
        sources: {
          'street-tiles': {
            type: 'raster',
            url: 'mapbox://mapbox.streets',
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'street',
            type: 'raster',
            source: 'street-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      }
    },
    mapOptions
  )
);

map.addControl(
  new MapboxGeocoder({
    accessToken: mapboxgl.accessToken
  })
);

const mapTerrain = new mapboxgl.Map(
  Object.assign(
    {
      container: 'mapTerrain',
      style: {
        version: 8,
        sources: {
          'terrain-tiles': {
            type: 'raster',
            url: 'mapbox://' + 'mapbox.terrain-rgb',
            tileSize: 256
          }
        },
        layers: [
          {
            id: 'terrain',
            type: 'raster',
            source: 'terrain-tiles',
            minzoom: 0,
            maxzoom: 22
          }
        ]
      }
    },
    mapOptions
  )
);

const label = document.getElementById('label');
const heightSlider = document.getElementById('heightfactor');

async function init() {
  const heights = await loadHeights();
  const width = 650;
  const height = 650;

  const camera = perspectiveCamera({
    fov: Math.PI / 4,
    near: 0.1,
    far: 1000,
    viewport: [0, 0, width, height]
  });

  camera.translate([-100, -100, -100].map(x => x * CAMERA_DISTANCE_FACTOR));
  camera.lookAt([0, 0, 0]);
  camera.update();

  const plotter = new Plotter();
  document.querySelector('.print-button').onclick = function() {
    plotter.print();
  };

  let timer = 0;
  const update = () => {
    clearTimeout(timer);
    timer = setTimeout(async () => {
      const heights = await loadHeights();
      const lines = getLines(heights, camera);
      const text = label.value;
      plotter.setAnimatedCoords(await getFinalCoords(lines, text));
      console.log(map.getCenter(), map.getZoom());
    }, 250);
  };

  update();

  map.on('moveend', update);
  map.on('moveend', () => {
    mapTerrain.setCenter(map.getCenter());
    mapTerrain.setZoom(map.getZoom());
    mapTerrain.setBearing(map.getBearing());
  });
  label.addEventListener('input', update);
  heightSlider.addEventListener('input', update);
}

map.on('load', init);

async function getFinalCoords(lines, text) {
  const label = text || 'UBILABS';
  const textCoords = await convertTextToCoords(label, {
    x: 496 / 2,
    y: 500,
    fontSize: 40,
    anchor: 'center middle'
  });

  const claim = await renderClaim();

  return [...lines, ...textCoords, ...claim];
}

/**
 * Returns the height values from a png terrain tile
 * @param {string} url The terrain tile url
 */
async function loadHeights(url) {
  const canvas = mapTerrain.getCanvas();
  const gl = canvas.getContext('webgl');
  const pixels = new Uint8Array(TILE_SIZE * TILE_SIZE * 4);

  gl.readPixels(0, 0, TILE_SIZE, TILE_SIZE, gl.RGBA, gl.UNSIGNED_BYTE, pixels);
  const heights = new Float32Array(pixels.length / 4);

  const zoom = map.getZoom();
  const tileLengthInMeter = (2 ** zoom / 20) * 1000;

  for (let i = 0; i < pixels.length; i = i + 4) {
    const r = pixels[i];
    const g = pixels[i + 1];
    const b = pixels[i + 2];
    const a = pixels[i + 3];
    const height = -10000 + (r * 256 * 256 + g * 256 + b) * 0.1;
    heights[i / 4] =
      (height / tileLengthInMeter) * tileLengthInMeter * heightSlider.value;
  }

  const normalizedHeights = normalizeHeights(heights);
  return normalizedHeights;
}

/**
 * Normalizes the heights
 * @param {Array} heights
 */
function normalizeHeights(heights) {
  const filtered = heights.map(x => {
    if (x < 0) {
      return 0;
    }
    if (x > 8900) {
      return 8900;
    }
    return x;
  });

  const maxValue = max(filtered);
  const minValue = min(filtered);
  const middle = (maxValue - minValue) / 2 + minValue;
  const norm = filtered.map(v => v - middle);
  return norm;
}

/**
 * Returns plottable lines from height values
 * @param {ArrayFloat32Array} heights A list of height values
 * @param {Object} camera The camera to project the coordinates
 */
function getLines(heights, camera) {
  const lines = Array.from({length: LINES}).map((_, ix) =>
    Array.from({length: LINES}).map((_, iz) => {
      const x = ix - LINES / 2;
      const z = iz - LINES / 2;

      const ihx = Math.floor((ix / LINES) * TILE_SIZE);
      const ihz = Math.floor((iz / LINES) * TILE_SIZE);
      const index = ihx * TILE_SIZE + ihz;

      const y = heights[index] / -200; // TODO: calculate the correct height
      return camera.project([x, y, z]);
    })
  );

  // reverse every second
  lines.forEach((line, index) => index % 2 && line.reverse());

  return move(lines, OFFSET);
}

function renderCoolPlaces(places) {
  const el = document.getElementById('coolplaces');
  places.map(place => {
    const link = document.createElement('a');
    link.href = '#';
    link.innerHTML = place.name;
    link.onclick = () => {
      map.setCenter({
        lng: place.lng,
        lat: place.lat
      });
      map.setZoom(place.zoom);
    };
    el.appendChild(link);
  });
}
