const PRECISION = 3;

/**
 * Converts an array of screen coordinates into SVG paths.
 *
 * @param {Array} lines List of screen coordinates.
 */
export function renderSVGPaths(lines) {
  return lines.map(line => {
    const path = line.map((p, index) => {
      const x = p[0].toFixed(PRECISION);
      const y = p[1].toFixed(PRECISION);

      return `${index == 0 ? 'M' : 'L'} ${x},${y}`;
    });

    return `<path d="${path.join(' ')}"/>`;
  });
};