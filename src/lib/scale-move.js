export function move(lines, offset) {
  return lines.map(line => {
    return line.map(([x, y]) => [x + offset.x, y + offset.y]);
  });
}