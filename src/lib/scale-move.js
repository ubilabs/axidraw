export function move(lines, offset) {
  return lines.map(line => {
    return line.map(([x, y]) => [x + offset.x, y + offset.y]);
  });
}

export function scale(lines, scale) {
  return lines.map(line => {
    return line.map(([x, y]) => [x * scale, y * scale]);
  });
}

export function scaleAndMove(lines, options) {
  return lines.map(line => {
    return line.map(([x, y]) => [
      x * options.scale + options.x,
      y * options.scale + options.y
    ]);
  });
}

