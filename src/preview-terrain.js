import perspectiveCamera from 'perspective-camera';
import {renderSVGPaths} from './lib/svg-tools';

const TILE_SIZE = 256;
const LINES = 60;
const ACCESS_TOKEN = 'pk.eyJ1IjoidWJpbGFicyIsImEiOiJ4Tm02bDJrIn0.aA51umnsZbzugtBiFLZPoQ';
const getTileUrl = (x,y,z) => `https://api.mapbox.com/v4/mapbox.terrain-rgb/${z}/${y}/${x}.pngraw?access_token=${ACCESS_TOKEN}`;

(async function() {
  const z = 9;
  const x = 109;
  const y = 98;
  const heights = await loadHeights(getTileUrl(x, y, z));
  const width = 650;
  const height = 650;

  const camera = perspectiveCamera({
    fov: Math.PI/4,
    near: 0.1,
    far: 1000,
    viewport: [0, 0, width, height]
  });

  camera.translate([-100, -100, -100]);
  camera.lookAt([-20, 20, 0]);
  camera.update();

  const lines = Array.from({length: LINES})
    .map((_, ix) => Array.from({length: LINES})
      .map((_, iz) => {
        const x = ix - LINES / 2;
        const z = iz - LINES / 2;

        const ihx = Math.floor(ix / LINES * TILE_SIZE);
        const ihz = Math.floor(iz / LINES * TILE_SIZE);
        const index = ihx * TILE_SIZE + ihz;
        
        const y = heights[index] / -40; // TODO: calculate the correct height
        return camera.project([x, y, z]);
      })
    );
  
  const paths = renderSVGPaths(lines);
  const svg = document.querySelector('#preview');
  svg.innerHTML = paths.join('\n');
}())

/**
 * Returns the height values from a png terrain tile
 * @param {string} url The terrain tile url
 */
function loadHeights(url) {
  const canvas = document.createElement('canvas');
  canvas.width = canvas.height = TILE_SIZE;
  const ctx = canvas.getContext('2d');
  const image = new Image();
  image.crossOrigin = 'Anonymous';

  return new Promise(resolve => {
    image.src = url;
    image.onload = () => {
      ctx.drawImage(image, 0, 0);
      const pixels = ctx.getImageData(0, 0, TILE_SIZE, TILE_SIZE).data;
      const heights = new Float32Array(pixels.length / 4);

      for (let i = 0; i < pixels.length; i=i+4) {
        const r = pixels[i];
        const g = pixels[i + 1];
        const b = pixels[i + 2];
        const a = pixels[i + 3];
        heights[i / 4] = -10000 + ((r * 256 * 256 + g * 256 + b) * 0.1);
      }
      resolve(heights);
    }
  });
}
