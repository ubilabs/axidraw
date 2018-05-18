import axidraw from './lib/pen-api';

(async function() {
  await axidraw.init();

  axidraw.drawPath([
    [1, 1],
    [2, 1],
    [2, 2],
    null,
    [3, 1],
    [4, 1],
    [4, 2],
    null,
    [3, 3],
    [4, 3],
    [4, 4]
  ]);
})();
