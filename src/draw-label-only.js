import plotMap from './lib/plot-map';
import Plotter from './lib/plot-coords';
import convertTextToCoords from './lib/convert-text-to-coords';

const label = document.getElementById('label');

const PAPER_SIZE = {
  width: 496,
  height: 700
};

async function update() {
  const text = label.innerText.toUpperCase();

  const textCoords = await convertTextToCoords(text, {
    x: PAPER_SIZE.width / 2,
    y: 515,
    fontSize: 40,
    anchor: 'center middle'
  });
  
  const plotter = new Plotter();

  plotter.coords = textCoords;
  plotter.print();
}

document.getElementById('print-button').addEventListener('click', update);

