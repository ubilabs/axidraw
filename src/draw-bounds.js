import Plotter from './lib/plot-coords';

const plotter  = new Plotter();

const PAPER_SIZE = {
  width: 496,
  height: 700
};

const paperBounds = [
  [0, 0],
  [PAPER_SIZE.width, 0],
  [PAPER_SIZE.width, PAPER_SIZE.height],
  [0, PAPER_SIZE.height],
  [0, 0]
];

plotter.coords = [paperBounds];

document.querySelector('.print-button').onclick = function(){
  plotter.print();
}