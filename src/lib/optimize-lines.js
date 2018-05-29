import distance from './distance';
/**
 * Picks the closest line in regard to a point.
 * @param {Array<number>} point  The origin point
 * @param {Array<array>} lines  The lines to pick from
 * @return {Array<array>}  The closest line to the point
 */
function pickClosestLine(point, lines) {
  let minDistance = Infinity;
  let nextLineIndex = null;
  let shouldReverse = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const distToStart = distance(point, line[0]);
    const distToEnd = distance(point, line[line.length - 1]);

    if (distToStart < minDistance) {
      nextLineIndex = i;
      shouldReverse = false;
      minDistance = distToStart;
    } else if (distToEnd < minDistance) {
      nextLineIndex = i;
      shouldReverse = true;
      minDistance = distToEnd;
    }
  }

  const line = lines[nextLineIndex];

  lines.splice(nextLineIndex, 1);

  return shouldReverse ? line.reverse() : line;
}

/**
 * Optimizres the ordering of the lines to improve plotting speed.
 * @param {Array<array>} lines  The lines to optimize.
 * @return {Array<array>}  The lines in an optimized order
 */
export function optimizeOrder(lines) {
  const linesCopy = lines.slice(0);
  const optimized = [];

  optimized.push(linesCopy.pop());

  while (linesCopy.length) {
    const previousLine = optimized[optimized.length - 1];
    const endpoint = previousLine[previousLine.length - 1];
    const nextLine = pickClosestLine(endpoint, linesCopy);

    optimized.push(nextLine);
  }

  return optimized;
}
