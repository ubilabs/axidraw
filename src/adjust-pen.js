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
  info.innerHTML = `
    Axidraw ready. <br />
    Move robot to the initial position [0, 0].
  `;

  button.disabled = false;
  button.onclick = adjustPen;
}

async function adjustPen() {
  info.innerHTML = `Setting pen state down…`;
  await axidraw.setPenState('state=draw');
  info.innerHTML = `Please insert pen at lowest position.`;
  button.onclick = parkPen;
}

async function parkPen() {
  info.innerHTML = `Setting pen state up…`;
  await axidraw.setPenState('state=up');
  await axidraw.resetMotor();
  info.innerHTML = `Done. You are now ready to draw!`;
  button.disabled = true;
}

window.addEventListener("load", initAxidraw);