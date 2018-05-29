import createAxidraw from './axidraw';
import getProjection from './get-projection';
import {optimizeOrder} from './optimize-lines';
import loadLines from './load-lines';
import mergeLines from './merge-lines';
import simplifyLines from './simplify-lines';
import {renderSVGPaths} from './svg-tools';
import cropLines from './crop-lines-by-circle';
import ProgressBar from './progress-bar';
import getCircle from './get-circle';
import {move, scale, scaleAndMove} from './scale-move';
import {logoCoords} from '../assets/ubilabs-logo'
import convertTextToCoords from './convert-text-to-coords';

const PAPER_SIZE = {
  width: 496,
  height: 700
};

const BOT_SCALE = {
  ratio: 12000 / 8720,
  factor: 14.2,
  offset: 20
};

const paperBounds = [
  [0, 0],
  [PAPER_SIZE.width, 0],
  [PAPER_SIZE.width, PAPER_SIZE.height],
  [0, PAPER_SIZE.height],
  [0, 0]
];

export default async function plotLines(options) {
  const progressBar = new ProgressBar(document.body);
  const axidraw = await createAxidraw();

  const coords = [];

  const project = getProjection(options);
  const circle = {
    center: [options.width / 2, options.height /  2],
    radius: options.height / 2 - 4
  };

  const mapPaths = await loadLines(options);
  const projectedMap = mapPaths.map(line => line.map(project));
  const croppedMap = cropLines(projectedMap, circle.center, circle.radius);
  const sortedMapPaths = optimizeOrder(croppedMap);
  const mergedMapPaths = mergeLines(sortedMapPaths);
  const simplifiedMap = simplifyLines(mergedMapPaths);

  simplifiedMap.unshift(
    getCircle(circle.radius, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 5, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 5.5, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 6, 180, circle.center[0], circle.center[1])
  );

  const centeredMap = move(simplifiedMap, {x: 100 / 2, y: 30})
  const scaledLogo = scaleAndMove(logoCoords, {scale: 0.25, x: 200, y: 640})

  const text = options.label || 'HAMBURG';
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

  const svgPaths = renderSVGPaths(coords);
  options.svg.innerHTML = svgPaths.join('\n');

  const stats = [];

  function logStats(label, lines) {
    stats.push({
      label: label,
      lines: lines.length,
      points: lines.reduce((acc, line) => acc + line.length, 0)
    });
  }

  logStats('original', projectedMap);
  logStats('cropped', croppedMap);
  logStats('merged', mergedMapPaths);
  logStats('simplified', simplifiedMap);
  console.table(stats);


  for (let i = 0; i < coords.length; i++) {
    const line = coords[i];
    const relativeLine = line.map(p => [
      p[0] / BOT_SCALE.factor + BOT_SCALE.offset,
      p[1] / BOT_SCALE.factor * BOT_SCALE.ratio
    ]);

    await axidraw.drawPath(relativeLine);
    progressBar.progress = i / (coords.length - 1);
  }

  await axidraw.parkPen();
}
