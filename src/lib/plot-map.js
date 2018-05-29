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
import {move} from './scale-move';

export default async function plotLines(viewport, debugSVG) {
  const progressBar = new ProgressBar(document.body);
  const axidraw = await createAxidraw();
  const project = getProjection(viewport);
  const circle = {
    center: [viewport.width / 2, viewport.height /  2],
    radius: viewport.height / 2 - 4
  };

  const lines = await loadLines(viewport);
  const projectedLines = lines.map(line => line.map(project));
  const croppedLines = cropLines(projectedLines, circle.center, circle.radius);
  const sortedLines = optimizeOrder(croppedLines);
  const mergedLines = mergeLines(sortedLines);
  const simplifiedLines = simplifyLines(mergedLines);

  simplifiedLines.unshift(
    getCircle(circle.radius, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 1, 180, circle.center[0], circle.center[1]),
    getCircle(circle.radius + 1.4, 180, circle.center[0], circle.center[1])
  );

  if (debugSVG) {
    simplifiedLines.unshift([
      [0, 0],
      [viewport.width, 0],
      [viewport.width, viewport.height],
      [0, viewport.height],
      [0, 0]
    ]);

    const movedLines = move(simplifiedLines, {x: 100 / 2, y: 30})

    const svgPaths = renderSVGPaths(movedLines);
    debugSVG.innerHTML = svgPaths.join('\n');
  }

  const stats = [];

  function logStats(label, lines) {
    stats.push({
      label: label,
      lines: lines.length,
      points: lines.reduce((acc, line) => acc + line.length, 0)
    });
  }

  logStats('original', projectedLines);
  logStats('cropped', croppedLines);
  logStats('merged', mergedLines);
  logStats('simplified', simplifiedLines);

  console.table(stats);

  for (let i = 0; i < simplifiedLines.length; i++) {
    const line = simplifiedLines[i];
    const relativeLine = line.map(p => [
      p[0] / viewport.width * 100,
      p[1] / viewport.height * 100
    ]);

    await axidraw.drawPath(relativeLine);
    progressBar.progress = i / (simplifiedLines.length - 1);
  }

  await axidraw.parkPen();
}
