import {geoPath, select, line} from 'd3';

import createAxidraw from './lib/axidraw';
import getProjection from './lib/get-projection';
import {optimizeOrder} from './lib/optimize-lines';
import loadLines from './lib/load-lines';
import simplify from 'simplify-js';

const JOIN_DISTANCE = 3;
const SIMPLIFY_TOLERANCE = 1;

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

  const projectedLines = lines.map(line => line.map(project));

  let html = '';

  const mergedLines = [];

  function distance(lastLine, nextLine) {
    const [x1, y1] = lastLine[lastLine.length - 1];
    const [x2, y2] = nextLine[0];

    return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
  }

  projectedLines.forEach(nextLine => {
    const lastLine = mergedLines[mergedLines.length - 1];

    if (lastLine && distance(lastLine, nextLine) < JOIN_DISTANCE) {
      lastLine.push(... nextLine);
      // lastLine.push(... nextLine.slice(1));
    } else {
      mergedLines.push(nextLine);
    }
  });

  const simplifiedLines = mergedLines.map(line => {
    const points = line.map(([x, y]) => ({x, y}));  // convert [x,y] to {x,y}
    return simplify(points, SIMPLIFY_TOLERANCE) // simplify
      .map(({x, y}) => [x, y]); // convert {x,y} back to [x,y]
  });

  simplifiedLines.forEach(line => {
    const svgPath = line.map((p, index) => {
      return `${index == 0 ? 'M' : 'L'} ${p}`;
    });

    html += `<path d="${svgPath}"/>`;
  });

  document.getElementById('map').innerHTML = html;

  console.log(`
    original:
    ${projectedLines.length} lines
    ${projectedLines.reduce((acc, line) => acc + line.length, 0)} points

    merged:
    ${mergedLines.length} lines
    ${mergedLines.reduce((acc, line) => acc + line.length, 0)} points

    simplifiedLines:
    ${simplifiedLines.length} lines
    ${simplifiedLines.reduce((acc, line) => acc + line.length, 0)} points
  `);

  for (const line of simplifiedLines) {
    const relativeLine = line.map(p => [
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

  plotLines(sortedLines);
})();
