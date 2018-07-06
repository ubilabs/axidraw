import createAxidraw from "./lib/axidraw";

const button = document.getElementById('button');
const info = document.getElementById('info');
let axidraw;

async function initAxidraw() {
  info.innerHTML = `loading …`;
  axidraw = await createAxidraw();
  initPosition();
}

async function initPosition() {
  await axidraw.resetMotor();

  info.innerHTML = `
    AxiDraw is ready! <br /> <br />
    Move robot to the initial position [0, 0] (most likely top left).
  `;

  button.disabled = false;
  button.onclick = adjustPen;
}

async function adjustPen() {
  info.innerHTML = `Setting pen state down…`;
  await axidraw.setPenState('state=0.8');
  info.innerHTML = `Please insert pen at lowest position, touching the surface.`;
  button.onclick = parkPen;
}

async function parkPen() {
  info.innerHTML = `Setting pen state up…`;
  await axidraw.setPenState('state=up');
  info.innerHTML = `Done. You are now ready to draw!<br /><br />You should now <a href="/draw-bounds.html" title="Draw the bounds">draw the bounds</a>.`;
  button.onclick = goToDrawBounds;
  button.innerHTML = 'Draw the bounds →'
}

async function goToDrawBounds() {
  window.location = '/draw-bounds.html';
}

window.addEventListener("load", initAxidraw);
