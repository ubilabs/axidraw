import createAxidraw from './lib/axidraw';

(async function() {
  const axidraw = await createAxidraw();
  const lines = [
    [[1, 1], [2, 1], [2, 2]],
    [[3, 1], [4, 1], [4, 2]],
    [[3, 3], [4, 3], [4, 4]]
  ];

  for (const line of lines) {
    await axidraw.drawPath(line);
  }
})();
