import {geoPath, select, line} from 'd3';

import createAxidraw from './lib/axidraw';
import getProjection from './lib/get-projection';
import {optimizeOrder} from './lib/optimize-lines';
import loadLines from './lib/load-lines';

const height = 100;
const width = 200;
const zoom = 18;
const center = [9.995, 53.565];

async function plotLines(lines) {
  const axidraw = await createAxidraw();
  const project = getProjection({
    width,
    height,
    zoom,
    center
  });

  for (const line of lines) {
    const projectedLine = line.map(project);
    const relativeLine = projectedLine.map(p => [
      p[0] / width * 100,
      p[1] / height * 100
    ]);

    await axidraw.drawPath(relativeLine);
  }
}

(async function() {
  const viewport = {
    width,
    height,
    zoom,
    center
  };
  const projection = getProjection(viewport);
  const geojsonToPath = geoPath(projection);

  const sortedLines = optimizeOrder(await loadLines(viewport));

  const geojson = {
    type: 'FeatureCollection',
    features: sortedLines.map(line => ({
      type: 'Feature',
      geometry: {type: 'LineString', coordinates: line}
    }))
  };
  const projectedPath = `
    <path
    fill="none"
    stroke="#000"
    vector-effect="non-scaling-stroke"
    d="${geojsonToPath(geojson)}">
  `;

  animation.innerHTML += projectedPath;

  plotLines(sortedLines);
})();
