import {geoMercator} from 'd3-geo';

/**
 * Get the mercator projection given a viewport.
 * @param {object} viewport  The viewport with width, heigth, zoom and center
 * @return {Function}  A `project` function
 */
export default function getProjection(viewport) {
  return geoMercator()
    .center(viewport.center)
    .scale(2 ** viewport.zoom / (2 * Math.PI))
    .translate([viewport.width / 2, viewport.height / 2])
    .precision(0);
}
