import Plotter from './lib/plot-coords';
import renderClaim from './assets/logo-and-claim';

async function init(){
  const claim = await renderClaim();
  const plotter = new Plotter();
  const coords = [];

  let x = 9;
  let y = 1;
  let z = 1;

  for (let i = 0; i < 3000; i++) {
    y += x - (x * z - y) / 99;
    x += (y - x) / 11;
    z += x * y / z - 1;
    coords.push([x * 5 + 250, y * 4 + 300]);
  }

  plotter.coords = [...claim, coords];

  document.querySelector('.print-button').onclick = function () {
    plotter.print();
  };
}

init();