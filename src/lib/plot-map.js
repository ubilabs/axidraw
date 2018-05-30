import getProjection from './get-projection';
import {optimizeOrder} from './optimize-lines';
import loadLines from './load-lines';
import mergeLines from './merge-lines';
import simplifyLines from './simplify-lines';
import cropLines from './crop-lines-by-circle';
import getCircle from './get-circle';
import {move, scale, scaleAndMove} from './scale-move';
import {logoCoords} from '../assets/ubilabs-logo'
import convertTextToCoords from './convert-text-to-coords';
import plot from './plot-coords';

const PAPER_SIZE = {
  width: 496,
  height: 700
};

const paperBounds = [
  [0, 0],
  [PAPER_SIZE.width, 0],
  [PAPER_SIZE.width, PAPER_SIZE.height],
  [0, PAPER_SIZE.height],
  [0, 0]
];

export default async function plotLines(options) {

  const coords = [];

  const project = getProjection(options);
  const circle = {
    center: [options.width / 2, options.height /  2],
    radius: options.height / 2 - 4
  };

  const mapPaths = await loadLines(options);
  const projectedPaths = mapPaths.map(line => line.map(project));
  const croppedPaths = cropLines(projectedPaths, circle.center, circle.radius);
  const sortedMapPaths = optimizeOrder(croppedPaths);
  const mergedMapPaths = mergeLines(sortedMapPaths);
  const simplifiedPaths = simplifyLines(mergedMapPaths);

  simplifiedPaths.unshift(
    getCircle(circle.radius, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 5, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 5.5, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 6, 180, circle.center[0], circle.center[1])
  );

  const centeredMap = move(simplifiedPaths, {x: 100 / 2, y: 30})
  const scaledLogo = scaleAndMove(logoCoords, {scale: 0.25, x: 200, y: 640})

  const text = options.label || 'UBILABS';
  const textCoords = await convertTextToCoords(text, {
    x: PAPER_SIZE.width / 2,
    y: 500,
    fontSize: 40,
    anchor: 'center middle'
  });

  coords.push(
    ...centeredMap,
    ...textCoords,
    ...scaledLogo,
    paperBounds
  );

  const stats = [];

  function logStats(label, lines) {
    stats.push({
      label: label,
      lines: lines.length,
      points: lines.reduce((acc, line) => acc + line.length, 0)
    });
  }

  logStats('original', projectedPaths);
  logStats('cropped', croppedPaths);
  logStats('merged', mergedMapPaths);
  logStats('simplified', simplifiedPaths);
  console.table(stats);

  const svg = document.getElementById('preview');
  plot(coords, svg);
}
