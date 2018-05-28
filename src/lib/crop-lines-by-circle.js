import distance from './distance';
import Line from 'line2';
import Vec2 from 'vec2';

/**
 * Crops all lines with intersections with a circle
 *
 * @param {Array} lines The list of lines
 * @param {Array} center The circle's center coordinates ([x, y])
 * @param {number} radius
 */
export default function (lines, center, radius) {
  // find all lines which have one point inside and one outside of the circle
  const matchingLines = lines.filter(line =>
    line.find(point => distance(center, point) < radius) &&
    line.find(point => distance(center, point) > radius)
  );
  const completelyInsideLines = lines.filter(line =>
    line.every(point => distance(center, point) < radius)
  );

  // split each line into multiple lines (one for each segment)
  const splittedLines = matchingLines
    .map(splitLine)
    .reduce((total, item) => total.concat(item), []);

  // crop the lines
  const croppedLines = splittedLines
    .map(line => cropLine(line, center, radius))
    .filter(Boolean);

  return [...completelyInsideLines, ...croppedLines];
}

/**
 * Splits a line into its segments.
 * @param {Array} line The line to split
 */
function splitLine(line) {
  const lines = [];
  
  for (let i = 0; i < line.length - 1; i++) {
    const point = line[i];
    const nextPoint = line[i + 1];
    
    lines.push([point, nextPoint]);
  }
  return lines;
}

/**
 * Crops a line by a circle
 * @param {Array} line The line to crop
 * @param {Array} center The circle center
 * @param {number} radius The cricle radius
 */
function cropLine(line, center, radius) {
  const newPoint = getIntersection(line, center, radius);
  const isStartInside = distance(center, line[0]) < radius;

  // no intersection
  if (!newPoint) {
    // return line when inside circle, null when completly outside
    return isStartInside ? line : null;
  }

  return isStartInside ?
    [line[0], newPoint] :
    [newPoint, line[1]];
}

/**
 * Returns the intersection point of a line with a circle.
 * Returns null if no intersection.
 * @param {Array} line The line to crop
 * @param {Array} center The circle center
 * @param {number} radius The cricle radius
 */
function getIntersection(line, center, radius) {
  const infiniteLine = new Line(...line[0], ...line[1]);
  const intersections =  infiniteLine.intersectCircle(
    new Vec2(...center),
    radius
  ).map(i => i.toArray());

  if (intersections.length === 0) {
    return null;
  }

  if (intersections.length === 1) {
    // sadly the library treats lines always as infinite, so we have to check if
    // one of the intersection points is on the line
    return checkIfPointIsOnLine(line, intersections[0]) ?
      intersections[0] :
      null;
  }

  // check which of the two intersection points is closer
  const distance0 = distance(intersections[0], line[0]);
  const distance1 = distance(intersections[1], line[0]);
  const closestPoint = distance0 < distance1 ?
    intersections[0] :
    intersections[1];

  return checkIfPointIsOnLine(line, closestPoint) ? closestPoint : null;
}

/**
 * Returns true if the point is on the line (not the best check but it works)
 * @param {Array} line The line to crop
 * @param {Array} point The point to check
 */
function checkIfPointIsOnLine(line, point) {
  let [pX, pY] = point;
  let [l1X, l1Y] = line[0];
  let [l2X, l2Y] = line[1];

  if (l1X > l2X) {
    const tmp = l2X;
    l2X = l1X;
    l1X = tmp;
  }

  if (l1Y > l2Y) {
    const tmp = l2Y;
    l2Y = l1Y;
    l1Y = tmp;
  }

  return pX >= l1X && pX <= l2X &&
    pY >= l1Y && pY <= l2Y;
}
