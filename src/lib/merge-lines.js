// join lines with a maximum gap of 3 pixel
const JOIN_DISTANCE = 3;

/**
 * Computes the distance (in pixels) between the last and next line.
 *
 * @param {Array} lastLine The last line.
 * @param {Array} nextLine The next line.
 */
function distance(lastLine, nextLine) {
  const [x1, y1] = lastLine[lastLine.length - 1];
  const [x2, y2] = nextLine[0];

  return Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
}

/**
 * Merges a line in an array if the next line's starting point is close
 * to the previous line's end point.
 *
 * @param {Array} lines An array of ordered lines with screen coordinates.
 */
export default function (lines) {
  const mergedLines = [];

  lines.forEach(nextLine => {
    const lastLine = mergedLines[mergedLines.length - 1];

    if (lastLine && distance(lastLine, nextLine) < JOIN_DISTANCE) {
      lastLine.push(...nextLine);
    } else {
      mergedLines.push(nextLine);
    }
  });

  return mergedLines;
}