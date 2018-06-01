import {convertSVGToCoords} from './lib/svg-tools';
import {scaleAndMove} from './lib/scale-move';
import Plotter from './lib/plot-coords';

const plotter  = new Plotter();

const logoSVGElement = document.getElementById("jsconf");
const coords = convertSVGToCoords(logoSVGElement, 0.1);
const translated = scaleAndMove(coords, {scale: 8, x: 85, y: 85})

plotter.coords = translated;

document.querySelector('.print-button').onclick = function(){
  plotter.print();
}