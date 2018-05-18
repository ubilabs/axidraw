import axidraw from './lib/pen-api';

axidraw.init();

const getSliderValue = id => Number(document.getElementById(id).value);
const points = [];

function update() {
  points.length = 0; // clear the points

  const amplitude = getSliderValue('amplitude');
  const offset = getSliderValue('offset');
  const frequency = getSliderValue('frequency');
  const width = getSliderValue('width');
  const lines = getSliderValue('lines');
  const step = 0.1;

  for (let line = 0; line < lines; line++) {
    for (let i = 0; i < width; i += step) {
      const y =
        Math.sin(i / frequency) * amplitude + offset + line * amplitude * 3;
      points.push([i, y]);
    }

    points.push(null);
  }

  drawSVG();
}

update();

function drawSVG() {
  const path = [];
  let penUp = false;

  points.forEach((p, index) => {
    if (p == null) {
      penUp = true;
      return;
    }

    const [x, y] = p;
    const instruction = index == 0 || penUp == true ? 'M' : 'L';
    path.push(`${instruction} ${x} ${y}`);

    penUp = false;
  });

  svg.innerHTML = `
    <path d="${path.join(' ')}" fill="transparent" stroke="black"/>
  `;
}

document
  .querySelectorAll('input[type="range"]')
  .forEach(input => input.addEventListener('input', update));

document
  .querySelector('#draw-button')
  .addEventListener('click', () => axidraw.drawPath(points));
