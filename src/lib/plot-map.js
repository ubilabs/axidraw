import getProjection from './get-projection';
import {optimizeOrder} from './optimize-lines';
import loadLines from './load-lines';
import mergeLines from './merge-lines';
import simplifyLines from './simplify-lines';
import cropLines from './crop-lines-by-circle';
import getCircle from './get-circle';
import {move, scale, scaleAndMove} from './scale-move';
import convertTextToCoords from './convert-text-to-coords';
import Plotter from './plot-coords';
import renderClaim from '../assets/logo-and-mapbox-claim';

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

const CIRCLE_OFFSET = {
  x: 100 / 2,
  y: 50
};

let plotter = null;

export default async function plotLines(options) {
  const coords = [];

  const project = getProjection(options);
  const circle = {
    center: [options.width / 2, options.height / 2],
    radius: options.height / 2 - 4
  };

  const claim = await renderClaim();

  const text = options.label || 'UBILABS';
  const textCoords = await convertTextToCoords(text, {
    x: PAPER_SIZE.width / 2,
    y: 530,
    fontSize: 40,
    anchor: 'center middle'
  });

  const circles = [
    getCircle(circle.radius, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 5, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 5.5, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 6, 180, circle.center[0], circle.center[1])
  ];

  const movedCircles = move(circles, CIRCLE_OFFSET);

  if (!plotter) {
    plotter = new Plotter();
  }

  plotter.coords = [...textCoords, ...claim, ...movedCircles];

  const mapPaths = await loadLines(options);
  const projectedPaths = mapPaths.map(line => line.map(project));
  const croppedPaths = cropLines(projectedPaths, circle.center, circle.radius);
  const sortedMapPaths = optimizeOrder(croppedPaths);
  const mergedMapPaths = mergeLines(sortedMapPaths);
  const simplifiedPaths = simplifyLines(mergedMapPaths);

  const centeredMap = move(simplifiedPaths, CIRCLE_OFFSET);

  coords.push(...movedCircles, ...textCoords, ...centeredMap, ...claim);

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

  plotter.coords = coords;

  const previewButton = document.querySelector('.preview-button');
  const printButton = document.querySelector('.print-button');
  const printButtonCancel = document.querySelector('.print-button-cancel');

  printButton.disabled = false;

  printButton.onclick = function() {
    plotter.print();

    printButton.disabled = true;
    previewButton.disabled = true;

    printButton.style.display = 'none';
    printButtonCancel.style.display = 'inline';

    printButtonCancel.addEventListener('click', () => plotter.abort());
  };
}
