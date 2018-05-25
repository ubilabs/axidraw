import {geoPath, select, line} from 'd3';

import createAxidraw from './lib/axidraw';
import getProjection from './lib/get-projection';
import {optimizeOrder} from './lib/optimize-lines';
import loadLines from './lib/load-lines';
import mergeLines from './lib/merge-lines';
import simplifyLines from './lib/simplify-lines';
import {renderSVGPaths} from './lib/svg-tools';
import cropLines from './lib/crop-lines';
import ProgressBar from './lib/progress-bar';

const height = 100;
const width = 200;
const zoom = 18;
const center = [9.995, 53.565];

const viewBox = [0, 0, width, height];

async function plotLines(lines) {
  const progressBar = (window.bar = new ProgressBar(document.body));
  const axidraw = await createAxidraw();
  const project = getProjection({
    width,
    height,
    zoom,
    center
  });

  const sortedLines = optimizeOrder(lines);
  const projectedLines = sortedLines.map(line => line.map(project));
  const croppedLines = cropLines(projectedLines, viewBox);
  const mergedLines = mergeLines(croppedLines);
  const simplifiedLines = simplifyLines(mergedLines);

  // add bounds for visual debugging
  simplifiedLines.unshift([
    [0, 0],
    [width, 0],
    [width, height],
    [0, height],
    [0, 0]
  ]);

  const svgPaths = renderSVGPaths(simplifiedLines);
  document.getElementById('map').innerHTML = svgPaths.join('\n');

  function logStats(label, lines) {
    console.log(`
      ${label}:
      ${lines.length} lines
      ${lines.reduce((acc, line) => acc + line.length, 0)} points
    `);
  }

  logStats('original', projectedLines);
  logStats('cropped', croppedLines);
  logStats('merged', mergedLines);
  logStats('simplified', simplifiedLines);

  for (let i = 0; i < simplifiedLines.length; i++) {
    const line = simplifiedLines[i];
    const relativeLine = line.map(p => [
      p[0] / width * 100,
      p[1] / height * 100
    ]);

    await axidraw.drawPath(relativeLine);
    progressBar.progress = i / simplifiedLines.length;
  }

  await axidraw.parkPen();
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
  const lines = await loadLines(viewport);

  plotLines(lines);
})();
