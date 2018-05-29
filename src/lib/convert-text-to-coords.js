import {convertSVGToCoords} from './svg-tools';
import TextToSVG from 'text-to-svg';

const FONT_FILE = '/assets/MecSoft.ttf';

// load font asynchrony
async function loadFont() {
  return new Promise(resolve => {
    TextToSVG.load(FONT_FILE, function (err, textToSVG) {
      resolve(textToSVG);
    });
  });
};

/**
 * Converts a text into screen coordinates based on a custom font.
 *
 * @param {String} text The text to render
 * @param {Object} options Optional options for TextToSVG.
 *   Default {y: 10, fontSize: 10}
 */
export default async function (text, options = {y: 50, fontSize: 50}) {
  const textToSVG = await loadFont();
  const path = textToSVG.getD(text, options);

  // remove closing line segment
  const cleanedPath = path
    .replace(/M([0-9\.\s-]+L)/g, 'M')
    .replace(/Z/g, ' ');

  // collect SVG path segments
  const segments = cleanedPath.split(/M/g)
    .map(segment => segment.length ? `<path d="M${segment}"></path>` : '')
    .join('\n');

  // render original SVG
  const svg = `<svg>${segments}</svg>`;

  // convert SVG to points
  const parser = new DOMParser();
  const svgDom = parser.parseFromString(svg, 'image/svg+xml');
  const lines = convertSVGToCoords(svgDom, 0.3);

  return lines;
}