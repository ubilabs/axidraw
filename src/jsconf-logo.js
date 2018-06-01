import {convertSVGToCoords} from './lib/svg-tools';
import Plotter from './lib/plot-coords';
import renderClaim from './assets/logo-and-claim';
import {scaleAndMove} from './lib/scale-move';
import convertTextToCoords from './lib/convert-text-to-coords';

const PAPER_SIZE = {
  width: 496,
  height: 700
};

const plotter  = new Plotter();
const logoSVGElement = document.getElementById("jsconf");
const label = document.getElementById('label');
const coords = convertSVGToCoords(logoSVGElement, 0.1);
const translated = scaleAndMove(coords, {scale: 8, x: 85, y: 85})

document.querySelector('.print-button').onclick = function(){
  plotter.print();
}



let claim;

async function update(){
  const text = label.innerText.toUpperCase();

  const textCoords = await convertTextToCoords(text, {
    x: PAPER_SIZE.width / 2,
    y: 500,
    fontSize: 40,
    anchor: 'center middle'
  });

  plotter.coords = [
    ...translated,
    ...claim,
    ...textCoords
  ];

}

async function init(){
  claim = await renderClaim();
  update();
  label.addEventListener('input', update);
}

init();