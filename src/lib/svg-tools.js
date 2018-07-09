import segments from 'svg-line-segments';
import linearize from 'svg-linearize';

const PRECISION = 3;
const TOLERANCE = 0.1;

/**
 * Converts an array of screen coordinates into SVG paths.
 *
 * @param {Array} lines List of screen coordinates.
 * @param {Object} options.renderAs output type: "text" (default), "nodes"
 */
export function renderSVGPaths(lines, options = {renderAs: 'text'}) {
  return lines.map(line => {
    const path = line.map((p, index) => {
      const x = p[0].toFixed(PRECISION);
      const y = p[1].toFixed(PRECISION);

      return `${index == 0 ? 'M' : 'L'} ${x},${y}`;
    });

    if (options.renderAs == 'text') {
      // return path as text
      return `<path d="${path.join(' ')}"/>`;
    } else if (options.renderAs == 'nodes') {
      // return path as DOM node
      const element = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'path'
      );
      element.setAttribute('d', path.join(' '));
      return element;
    } else {
      // return list of instructions
      return path;
    }
  });
}

/**
 * Returns the svg with paths only
 * @param {Object} svg The svg element
 */
function convertLinesToPaths(svg) {
  const newPathsOnly = svg.cloneNode(true);
  const lines = newPathsOnly.querySelectorAll('line');

  for (let i = 0; i < lines.length; i++) {
    const x1 = lines[i].getAttribute('x1');
    const y1 = lines[i].getAttribute('y1');
    const x2 = lines[i].getAttribute('x2');
    const y2 = lines[i].getAttribute('y2');

    const pathElement = document.createElement('path');
    pathElement.setAttribute('d', 'M ' + x1 + ',' + y1 + ' L ' + x2 + ',' + y2);

    lines[i].parentNode.replaceChild(pathElement, lines[i]);
  }

  return newPathsOnly;
}

/**
 * Returns the svg in screen coordinates
 * @param {Object} svg    		The svg element
 * @param {number} tolerance	The tolerance for segmentation
 * @return {Array<array>} 		The svg coordinates
 */
export function convertSVGToCoords(svg, tolerance) {
  const svgPathsOnly = convertLinesToPaths(svg);
  const linearizedSvg = linearize(svgPathsOnly, {
    tolerance: tolerance || TOLERANCE
  });
  const coords = segments(linearizedSvg);

  return coords;
}

/**
 * Returns the positioned and scaled coordinates
 * @param {Array<array>}	List of screen coordinates
 * @param {number} x      The left position
 * @param {number} y      The top position
 * @param {number} zoom   The zoom factor
 * @return {Array<array>} The positioned and scaled screen coordinates
 */
export function positionAndScaleCoords(coords, x, y, zoom) {
  return coords.map(line =>
    line.map(coord => [coord[0] * zoom + x, coord[1] * zoom + y])
  );
}
