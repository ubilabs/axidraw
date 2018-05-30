import createAxidraw from './axidraw';
import ProgressBar from './progress-bar';
import {renderSVGPaths} from './svg-tools';

const BOT_SCALE = {
  ratio: 12000 / 8720,
  factor: 14.2,
  offset: 20
};

/**
 * Plots a the list of coords on SVG and Axidraw.
 *
 * @param {Array} coords List of lines to draw;
 * @param {Element} svgContainer Container to render data
 */
export default async function(coords, svgContainer){
  const axidraw = await createAxidraw();
  const progressBar = new ProgressBar(document.body);

  const paths = renderSVGPaths(coords);
  svgContainer.innerHTML = paths.join('\n');

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