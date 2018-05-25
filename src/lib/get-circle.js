export default function getCircle(radius = 1, steps = 360, xOffset = 0, yOffset = 0) {
  const rad = Math.PI / 180
  const radPerStep = 360 / steps * rad;

  const points = Array
    .from({length: steps})
    .map((_, index) => {
      let x = Math.sin(radPerStep * index) * radius;
      let y = Math.cos(radPerStep * index) * radius;
      x = Math.round(x * 100) / 100;
      y = Math.round(y * 100) / 100;

      return [
        x + xOffset,
        y + yOffset
      ];
    });

  points.push(points[0]);

  return points;
}
