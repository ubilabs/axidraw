import plotMap from './lib/plot-map';

const width = 200;
const height = 100;
const zoom = 18;
const center = [9.995, 53.565];

plotMap({width, height, zoom, center}, document.querySelector('#map'));
