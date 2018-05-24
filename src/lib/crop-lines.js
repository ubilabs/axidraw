/**
 * Removes all paths that are outside of the drawing area.
 * Could be improved to work on points but should help already.
 *
 * @param {Array} lines The list of lines
 * @param {Array} viewBox View box `[minX, minY, width, height]`
 */
export default function (lines, viewBox) {
  const [minX, minY, width, height] = viewBox;

  // simple but stupid filter that just excludes paths
  // where all points are outside

  // TODO: exclude points instead of lines
  // TODO: compute intersection
  return lines.filter(line => {
    let allOutside = true;

    line.forEach(([x, y]) => {
      if (
        x > minX &&
        y > minY &&
        x < minX + width &&
        y < minY + height
      ) {
        allOutside = false;
      }
    });

    return !allOutside;
  });
}