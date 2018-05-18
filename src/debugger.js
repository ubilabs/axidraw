import io from 'socket.io-client';
import TWEEN from '@tweenjs/tween.js';

import Recoder from './lib/recorder';

const SPEED_FACTOR = 25;

async function getArea() {
  const response = await fetch('http://localhost:4242/v1/settings/bot/');
  const {maxArea} = await response.json();

  return {
    width: Number(maxArea.width),
    height: Number(maxArea.height)
  };
}

function initCanvas(area) {
  const canvas = document.createElement('canvas');

  canvas.width = window.innerWidth * 0.9;
  canvas.height = canvas.width * (area.height / area.width);

  document.body.appendChild(canvas);

  return canvas;
}

function clear(canvas) {
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function drawPen(context, pen, startPosition) {
  context.fillStyle = pen.state === 'draw' ? '#000' : 'rgba(0,0,0,0.5)';

  context.beginPath();
  context.arc(...pen.position, 3, 0, 2 * Math.PI);
  context.fill();

  // animate the current line segment if in draw modw
  if (pen.state === 'draw') {
    context.beginPath();
    context.moveTo(...startPosition);
    context.lineTo(...pen.position);
    context.stroke();
  }
}

function drawLines(context, lines) {
  context.strokeStyle = '#000';
  context.lineWidth = 1;

  for (let i = 0; i < lines.length; i++) {
    const isLast = i === lines.length - 1;
    // draw all recorded lines, skip the last line segment, because this needs
    // to be animated (see drawPen())
    const line = isLast
      ? [...lines[i].slice(0, lines[i].length - 1)]
      : lines[i];

    if (!line.length) continue;

    context.beginPath();
    context.moveTo(...line[0]);
    line.slice(1).forEach(point => context.lineTo(...point));
    context.stroke();
  }
}

// transform axibot coords to canvas coords
function createTransformer(canvas, area) {
  return coord => [
    canvas.width * (coord[0] / area.width),
    canvas.height * (coord[1] / area.height)
  ];
}

(async function() {
  const area = await getArea();

  const canvas = initCanvas(area);
  const context = canvas.getContext('2d');

  const transformCoord = createTransformer(canvas, area);
  const recorder = new Recoder();

  const pen = {
    position: [0, 0],
    state: 'up'
  };

  let isAnimating = false;

  // queue of events to execute comming from the socket
  const events = [];

  function update() {
    // pick the oldest event
    const event = events.shift();

    if (!event) return;

    const start = [...pen.position];

    const drawAnimation = new TWEEN.Tween(pen.position)
      .to(transformCoord([event.x, event.y]), event.lastDuration / SPEED_FACTOR)
      .onUpdate(function() {
        clear(canvas);

        drawPen(context, pen, start);
        drawLines(
          context,
          recorder.lines.map(line => line.map(transformCoord))
        );
      })
      .onStart(() => (isAnimating = true))
      .onComplete(() => (isAnimating = false));

    pen.state = event.state;
    recorder.record(event);

    drawAnimation.start();
  }

  io('ws://localhost:4242').on('pen update', event => events.push(event));

  function loop(time) {
    requestAnimationFrame(loop);
    TWEEN.update(time);

    if (!isAnimating) update();
  }

  requestAnimationFrame(loop);
})();
