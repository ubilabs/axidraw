import simplify from 'simplify-js';

const SIMPLIFY_TOLERANCE = 1;

/**
 * Simplifies the coords of lines.
 * @param {Array} lines The list of lines
 */
export default function (lines) {
  return lines.map(line => {
    // convert [x,y] to {x,y} format needed for simplify.js
    const points = line.map(
      ([x, y]) => ({x, y})
    );

    const simplifiedPath = simplify(points, SIMPLIFY_TOLERANCE);

    // convert {x,y} back to [x,y]
    const coords = simplifiedPath.map(
      ({x, y}) => [x, y]
    );

    return coords;
  });
}
